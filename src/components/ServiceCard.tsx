import { Icon } from "@/components/ui/icon";
import { BanknoteIcon, CreditCardIcon, ShieldIcon } from "lucide-react-native";
import { Pressable, ScrollView, Text, View } from "react-native";

const serviceData = [
    {
        id: 1,
        title: "Empréstimo",
        description: "Crédito rápido e fácil para suas necessicdades.",
        icon: BanknoteIcon,
    },
    {
        id: 2,
        title: "Seguro",
        description: "Crédito rápido e fácil para suas necessicdades..",
        icon: ShieldIcon,
    },
    {
        id: 3,
        title: "Consórcio",
        description: "Crédito rápido e fácil para suas necessicdades.",
        icon: CreditCardIcon,
    },

];

export function ServiceCard() {
    return (
        <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            className="mt-4 max-h-52 flex-grow-0"
            contentContainerClassName="gap-4 px-4 pb-1"
        >
            {serviceData.map((service) => {
                return (
                    <Pressable 
                        key={service.id}
                        className="w-[220] h-[160] shrink-0 rounded-md bg-primary p-4"
                    >
                        <Icon as={service.icon} size={28} color="#111" />
                        <Text className="mt-2 font-sans-bold text-lg text-primary-foreground">
                            {service.title}
                        </Text>
                        <Text className="mt-1 text-sm font-sans-medium text-primary-foreground/70">
                            {service.description}
                        </Text>
                    </Pressable>
                );
            })}
        </ScrollView>
    );
}
