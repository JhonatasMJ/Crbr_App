import { Linking } from "react-native";

export function redirectWhatsapp({message}: {message: string}) {
    const whatsappNumber = "5516991380243";
    const url = `https://wa.me/${whatsappNumber}?text=${message}`;
    Linking.openURL(url);
}