import { Redirect } from "expo-router";

export default function Index() {
  // Always redirect to home
  return <Redirect href="/(tabs)/home" />;
}