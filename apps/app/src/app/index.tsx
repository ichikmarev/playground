import { useRouter } from "expo-router";
import { Button, H1, YStack } from "tamagui";

export default function HomeScreen() {
	const router = useRouter();

	return (
		<YStack
			flex={1}
			alignItems="center"
			justifyContent="center"
			gap="$4"
			padding="$4"
		>
			<H1>Zapp</H1>
			<Button onPress={() => router.push("/users")}>View Users</Button>
			<Button onPress={() => router.push("/products")}>View Products</Button>
		</YStack>
	);
}
