// IntentJS Demo Chatbot Page
import ChatInterface from "@/components/demo/intent/ChatInterface";

export default async function IntentJSChatPage() {
  // Data configuration for IntentJS chatbot demo
  // Note: System_Prompt is not used in the new API implementation
  // The backend handles the chatbot configuration based on converslyWebId
  const data = {
    id: 14, // Chatbot ID (for reference/tracking purposes)
    userId: "cm5qiv3oy000026be62kwibwn", 
    name: "IntentJS Documentation Assistant",
    isAuthenticated: true, // Set to true for demo, or implement proper auth later
    System_Prompt: "", // Backend handles the system prompt configuration
  };

  return (
    <ChatInterface data={data} />
  );
}