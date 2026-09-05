const { onSchedule } = require("firebase-functions/v2/scheduler");
const { logger } = require("firebase-functions");
const { initializeApp } = require("firebase-admin/app");
const { getDatabase } = require("firebase-admin/database");

initializeApp();

const EXPO_PUSH_URL = "https://exp.host/--/api/v2/push/send";
const TIME_ZONE = "America/Sao_Paulo";
const ACTIVE_STATUS = "ativo";

function todayInSaoPaulo() {
  const parts = new Intl.DateTimeFormat("pt-BR", {
    timeZone: TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(new Date());

  const get = (type) => Number(parts.find((p) => p.type === type)?.value);
  return { day: get("day"), month: get("month"), year: get("year") };
}

/** `endDate` é salvo como "dd/MM/yyyy" (ver src/shared/utils/investmentDates.ts). */
function parseBrDate(value) {
  const [day, month, year] = String(value).split("/").map(Number);
  if (!day || !month || !year) return null;
  return { day, month, year };
}

function toComparable({ day, month, year }) {
  return year * 10000 + month * 100 + day;
}

function isOnOrBefore(a, b) {
  return toComparable(a) <= toComparable(b);
}

async function sendExpoPushNotifications(messages) {
  const CHUNK_SIZE = 100;
  for (let i = 0; i < messages.length; i += CHUNK_SIZE) {
    const chunk = messages.slice(i, i + CHUNK_SIZE);
    const response = await fetch(EXPO_PUSH_URL, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(chunk),
    });

    if (!response.ok) {
      logger.error("Falha ao enviar push para o Expo", {
        status: response.status,
        body: await response.text().catch(() => ""),
      });
    }
  }
}

/**
 * Roda 1x/dia: procura investimentos ativos cujo vencimento já chegou e
 * ainda não foram notificados, envia push para os dispositivos do dono e
 * marca `maturityNotifiedAt` para não notificar de novo.
 */
exports.checkInvestmentMaturities = onSchedule(
  {
    schedule: "0 9 * * *",
    timeZone: TIME_ZONE,
    region: "southamerica-east1",
  },
  async () => {
    const db = getDatabase();
    const usersSnap = await db.ref("users").get();
    if (!usersSnap.exists()) {
      logger.info("Nenhum usuário encontrado.");
      return;
    }

    const today = todayInSaoPaulo();
    const messages = [];
    const updates = {};

    usersSnap.forEach((userSnap) => {
      const uid = userSnap.key;
      const investmentsSnap = userSnap.child("investments");
      if (!investmentsSnap.exists()) return;

      const tokens = [];
      userSnap.child("pushTokens").forEach((tokenSnap) => {
        const token = tokenSnap.child("token").val();
        if (typeof token === "string" && token.trim()) tokens.push(token);
      });

      if (tokens.length === 0) return;

      investmentsSnap.forEach((invSnap) => {
        const investment = invSnap.val();
        if (!investment || investment.maturityNotifiedAt) return;

        const status = String(investment.status ?? "").trim().toLowerCase();
        if (status !== ACTIVE_STATUS) return;

        const endDate = parseBrDate(investment.endDate);
        if (!endDate || !isOnOrBefore(endDate, today)) return;

        const investmentId = invSnap.key;
        const name =
          investment.investmentName || investment.name || "seu investimento";

        for (const token of tokens) {
          messages.push({
            to: token,
            sound: "default",
            title: "Investimento vencido",
            body: `${name} venceu em ${investment.endDate}. Acesse o app para resgatar ou reinvestir.`,
            data: { investmentId, type: "investment-maturity" },
          });
        }

        updates[`users/${uid}/investments/${investmentId}/maturityNotifiedAt`] =
          Date.now();
      });
    });

    if (messages.length > 0) {
      logger.info(`Enviando ${messages.length} push notification(s).`);
      await sendExpoPushNotifications(messages);
    }

    if (Object.keys(updates).length > 0) {
      await db.ref().update(updates);
    }
  },
);
