"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Bot, Send, User, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface Message {
  role: "user" | "assistant";
  content: string;
}

export function AIChatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: "Hi there! I'm your HR assistant. How can I help you with your projects and tasks today?",
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!input.trim()) return;
    
    // Add user message
    const userMessage: Message = {
      role: "user",
      content: input,
    };
    
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);
    
    try {
      // Simulate AI response (in a real app, this would call an API)
      await new Promise((resolve) => setTimeout(resolve, 1000));
      
      let response = "I'm sorry, I don't have enough information to answer that question.";
      
      // Simple pattern matching for demo purposes
      const query = input.toLowerCase();
      
      if (query.includes("project") && query.includes("list")) {
        response = "You can view all your projects in the Projects section. Click on 'Projects' in the sidebar to see the list.";
      } else if (query.includes("add") && query.includes("task")) {
        response = "To add a new task, go to a specific project and click the 'Add Task' button. You'll need to provide a title, description, priority, and status.";
      } else if (query.includes("kanban")) {
        response = "The Kanban board helps you visualize your tasks by status. You can drag tasks between columns to update their status. Access it from any project page.";
      } else if (query.includes("salary") || query.includes("payroll")) {
        response = "You can manage employee salaries in the Salary Table. Go to Employees > Salary Table, select a month and year, and add bonuses or deductions as needed.";
      } else if (query.includes("employee") && query.includes("add")) {
        response = "To add a new employee, go to the Employees section and click 'Add Employee'. You'll need to provide their ID, name, joining date, and basic salary.";
      } else if (query.includes("help")) {
        response = "I can help you with information about managing projects, tasks, employees, and salaries. Just ask me specific questions about these topics!";
      }
      
      const assistantMessage: Message = {
        role: "assistant",
        content: response,
      };
      
      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      console.error("Error processing message:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* Floating chat button */}
      <Button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-4 right-4 rounded-full h-12 w-12 p-0 shadow-lg"
      >
        <Bot className="h-6 w-6" />
      </Button>
      
      {/* Chat window */}
      <div
        className={cn(
          "fixed bottom-4 right-4 w-80 md:w-96 z-50 transition-all duration-300 ease-in-out",
          isOpen ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4 pointer-events-none"
        )}
      >
        <Card className="shadow-lg border-2">
          <CardHeader className="p-4 pb-2 flex flex-row justify-between items-center">
            <CardTitle className="text-lg flex items-center gap-2">
              <Bot className="h-5 w-5" />
              HR Assistant
            </CardTitle>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => setIsOpen(false)}
            >
              <X className="h-4 w-4" />
            </Button>
          </CardHeader>
          <CardContent className="p-4 h-80 overflow-y-auto">
            <div className="space-y-4">
              {messages.map((message, index) => (
                <div
                  key={index}
                  className={cn(
                    "flex",
                    message.role === "user" ? "justify-end" : "justify-start"
                  )}
                >
                  <div className="flex items-start gap-2 max-w-[80%]">
                    {message.role === "assistant" && (
                      <Avatar className="h-8 w-8">
                        <AvatarFallback className="bg-primary text-primary-foreground">
                          <Bot className="h-4 w-4" />
                        </AvatarFallback>
                      </Avatar>
                    )}
                    <div
                      className={cn(
                        "rounded-lg px-3 py-2 text-sm",
                        message.role === "user"
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted"
                      )}
                    >
                      {message.content}
                    </div>
                    {message.role === "user" && (
                      <Avatar className="h-8 w-8">
                        <AvatarFallback className="bg-muted">
                          <User className="h-4 w-4" />
                        </AvatarFallback>
                      </Avatar>
                    )}
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="flex items-start gap-2 max-w-[80%]">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="bg-primary text-primary-foreground">
                        <Bot className="h-4 w-4" />
                      </AvatarFallback>
                    </Avatar>
                    <div className="rounded-lg px-3 py-2 text-sm bg-muted">
                      <div className="flex gap-1">
                        <div className="h-2 w-2 rounded-full bg-current animate-bounce" />
                        <div className="h-2 w-2 rounded-full bg-current animate-bounce delay-75" />
                        <div className="h-2 w-2 rounded-full bg-current animate-bounce delay-150" />
                      </div>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          </CardContent>
          <CardFooter className="p-4 pt-2">
            <form onSubmit={handleSubmit} className="flex w-full gap-2">
              <Input
                placeholder="Ask about your projects and tasks..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                disabled={isLoading}
                className="flex-1"
              />
              <Button type="submit" size="icon" disabled={isLoading}>
                <Send className="h-4 w-4" />
              </Button>
            </form>
          </CardFooter>
        </Card>
      </div>
    </>
  );
}