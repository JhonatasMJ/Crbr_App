import { BeneficiaryCard } from "@/components/BeneficiaryCard";
import { BeneficiarySheetContent } from "@/components/BeneficiarySheetContent";
import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Text } from "@/components/ui/text";
import { useBottomSheetContext } from "@/context/bottomShet.context";
import { useBeneficiary } from "@/context/beneficiary.context";
import { Beneficiary as BeneficiaryType } from "@/types/beneficiary";
import { useCallback, useMemo } from "react";
import { FlatList, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function Beneficiary() {
  const { beneficiary } = useBeneficiary();
  const { openBottomSheet } = useBottomSheetContext();

  const totalPercentage = useMemo(
    () =>
      beneficiary.reduce(
        (acc, item) => acc + (Number(item.percentage) || 0),
        0,
      ),
    [beneficiary],
  );

  const showAddBeneficiaryButton = totalPercentage < 100;
  const maxPercentageAdd = Math.max(0, 100 - totalPercentage);

  const openBeneficiarySheet = useCallback(
    (toEdit: BeneficiaryType | null) => {
      const maxPercentage = toEdit
        ? Math.max(
            0,
            100 -
              totalPercentage +
              (Number(toEdit.percentage) || 0),
          )
        : maxPercentageAdd;
      openBottomSheet(
        <BeneficiarySheetContent
          key={toEdit?.id ?? "new"}
          maxPercentage={maxPercentage}
          beneficiaryToEdit={toEdit}
        />,
        1,
      );
    },
    [maxPercentageAdd, openBottomSheet, totalPercentage],
  );

  return (
    <View className="flex-1 bg-background">
      <Header
        logo={false}
        span="Visualize e edite seus beneficiários"
        title="Beneficiários"
      />
      <View className="mt-4 flex-1 px-6 pt-4">
        {beneficiary.length > 0 && (
          <View className="mb-4 flex-row items-center justify-between">
            <Text className="font-sans-semibold text-xl text-white">Total</Text>
            <Text className="rounded-sm bg-primary px-2 py-1 font-sans-bold text-xs text-secondary">
              {totalPercentage}%
            </Text>
          </View>
        )}
        <View className="flex-1">
          {beneficiary.length > 0 ? (
            <FlatList
              className="flex-1"
              data={beneficiary}
              renderItem={({ item }: { item: BeneficiaryType }) => (
                <BeneficiaryCard
                  beneficiaryId={item.id ?? ""}
                  name={item.name}
                  cpf={item.cpf}
                  percentage={item.percentage}
                  onPress={() => {
                    openBeneficiarySheet(item);
                  }}
                  onEditPress={() => {
                    openBeneficiarySheet(item);
                  }}
                />
              )}
              keyExtractor={(item) => item.id}
              ItemSeparatorComponent={() => <View className="h-4" />}
            />
          ) : (
            <View className="flex-1 items-center justify-center">
              <Text className="mb-2 font-sans-semibold text-lg text-white">
                Nenhum beneficiário cadastrado
              </Text>

              <Text className="text-center font-sans-medium text-sm text-zinc-500">
                Você ainda não cadastrou beneficiarios para receber seus
                investimentos em caso de falecimento
              </Text>
            </View>
          )}
        </View>

        {showAddBeneficiaryButton ? (
          <SafeAreaView edges={["bottom"]} className="pt-3">
            <Button
              className="bg-primary"
              size="xl"
              onPress={() => {
                openBeneficiarySheet(null);
              }}
            >
              <Text className="font-sans-bold text-lg text-black">
                Adicionar beneficiário
              </Text>
            </Button>
          </SafeAreaView>
        ) : null}
      </View>
    </View>
  );
}
