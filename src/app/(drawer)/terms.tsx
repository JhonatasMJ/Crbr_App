import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Header } from "@/components/Header";
import { Text } from "@/components/ui/text";
import { ScrollView, View } from "react-native";

type TermsItem = {
  value: string;
  title: string;
  description: string;
};

const TERMS_ITEMS: TermsItem[] = [
  {
    value: "rendimento-prazo",
    title: "Rendimento e prazo",
    description:
      "Cada investimento tem um ciclo de 4 meses ou anual, conforme escolhido no momento da aplicação. Durante o ciclo, o rendimento é acumulado proporcionalmente ao tempo decorrido, até o total de 10% do valor principal aplicado ao final do período.",
  },
  {
    value: "saque-antecipado",
    title: "Saque antecipado (antes do vencimento)",
    description:
      "Você pode solicitar o saque total do seu investimento a qualquer momento, mesmo antes do vencimento do ciclo. Nesse caso, apenas o valor principal aplicado é liberado,o rendimento acumulado até a data da solicitação não é pago e fica disponível somente após o vencimento do ciclo.",
  },
  {
    value: "saque-total",
    title: "Saque total após o vencimento",
    description:
      "Após o vencimento do ciclo, o saque total libera o valor principal somado ao rendimento acumulado no período.",
  },
  {
    value: "saque-rendimento",
    title: "Saque de rendimento",
    description:
      "O saque apenas do rendimento (sem retirar o principal) só pode ser solicitado após o vencimento do ciclo. Uma vez aprovado, o valor principal permanece aplicado e um novo ciclo se inicia automaticamente a partir dessa data.",
  },
  {
    value: "reinvestimento",
    title: "Reinvestimento",
    description:
      "Também após o vencimento do ciclo, é possível solicitar o reinvestimento: o rendimento acumulado é incorporado ao valor principal e o investimento recomeça por um novo ciclo de mesma duração, agora com o saldo atualizado.",
  },
  {
    value: "solicitacoes",
    title: "Solicitações e aprovação",
    description:
      "Toda solicitação de saque ou reinvestimento passa por análise antes de ser concluída. Enquanto houver uma solicitação em análise para um investimento, não é possível abrir uma nova solicitação para ele.",
  },
  {
    value: "termos-conta",
    title: "Termos de conta",
    description:
      "O acesso à plataforma exige e-mail verificado e cadastro completo. Os dados informados, incluindo beneficiários cadastrados, são utilizados exclusivamente para a gestão da sua conta e dos seus investimentos.",
  },
];

export default function Terms() {
  return (
    <View className="flex-1 bg-background">
      <Header
        logo={false}
        span="Regras de investimento e da sua conta"
        title="Termos"
        backHref="/(drawer)"
      />
      <ScrollView
        className="px-6 pt-4 mt-4"
        contentContainerClassName="pb-10"
        showsVerticalScrollIndicator={false}
      >
        <Accordion type="single" collapsible defaultValue="">
          {TERMS_ITEMS.map((item) => (
            <AccordionItem key={item.value} value={item.value}>
              <AccordionTrigger>
                <Text className="flex-1 pr-3">{item.title}</Text>
              </AccordionTrigger>
              <AccordionContent>
                <Text className="text-gray-300">{item.description}</Text>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </ScrollView>
    </View>
  );
}
