"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Bot, Send, User, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface Message {
  role: "user" | "assistant";
  content: string;
}

interface Project {
  id: string;
  name: string;
  description: string;
  tasks: Task[];
}

interface Task {
  id: string;
  title: string;
  description: string | null;
  status: string;
  priority: string;
  assignee: {
    name: string;
  } | null;
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
  const [projects, setProjects] = useState<Project[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Fetch projects and tasks on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [projectsRes, tasksRes] = await Promise.all([
          fetch("/api/projects"),
          fetch("/api/tasks"),
        ]);

        if (!projectsRes.ok || !tasksRes.ok) {
          throw new Error("Failed to fetch data");
        }

        const projectsData = await projectsRes.json();
        const tasksData = await tasksRes.json();

        setProjects(projectsData.projects);
        setTasks(tasksData.tasks);
      } catch (error) {
        console.error("Error fetching data:", error);
        toast.error("Failed to load project data");
      }
    };

    fetchData();
  }, []);

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
      const response = await fetch("/api/ai-chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: input,
          projects,
          tasks,
        }),
      });

      let data;
      const contentType = response.headers.get("content-type");
      if (contentType && contentType.includes("application/json")) {
        data = await response.json();
      } else {
        throw new Error("Invalid response format from server");
      }

      if (!response.ok) {
        throw new Error(data.error || "Failed to get AI response");
      }

      if (!data.reply) {
        throw new Error("No response received from AI");
      }
      
      const assistantMessage: Message = {
        role: "assistant",
        content: data.reply,
      };
      
      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      console.error("Error processing message:", error);
      
      const errorMessage = error instanceof Error 
        ? error.message 
        : "I'm sorry, I encountered an error while processing your request.";
      
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
            content: "I apologize, but I'm having trouble connecting to my brain right now. Please try again in a moment.",
        },
      ]);
      
      toast.error("Failed to get AI response. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* Floating chat button */}
      <Button
        onClick={() => setIsOpen(true)}
        className="right-4 bottom-4 fixed shadow-lg p-0 rounded-full w-12 h-12"
      >
        <Bot className="w-6 h-6" />
      </Button>
      
      {/* Chat window */}
      <div
        className={cn(
          "fixed bottom-4 right-4 w-80 md:w-96 z-50 transition-all duration-300 ease-in-out",
          isOpen ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4 pointer-events-none"
        )}
      >
        <Card className="shadow-lg border-2">
          <CardHeader className="flex flex-row justify-between items-center p-4 pb-2">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Bot className="w-5 h-5" />
              HR Assistant
            </CardTitle>
            <Button
              variant="ghost"
              size="icon"
              className="w-8 h-8"
              onClick={() => setIsOpen(false)}
            >
              <X className="w-4 h-4" />
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
                      <Avatar className="w-8 h-8">
                        <AvatarFallback className="bg-primary text-primary-foreground">
                          <Bot className="w-4 h-4" />
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
                      <Avatar className="w-8 h-8">
                        <AvatarFallback className="bg-muted">
                          <User className="w-4 h-4" />
                        </AvatarFallback>
                      </Avatar>
                    )}
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="flex items-start gap-2 max-w-[80%]">
                    <Avatar className="w-8 h-8">
                      <AvatarFallback className="bg-primary text-primary-foreground">
                        <Bot className="w-4 h-4" />
                      </AvatarFallback>
                    </Avatar>
                    <div className="bg-muted px-3 py-2 rounded-lg text-sm">
                      <div className="flex gap-1">
                        <div className="bg-current rounded-full w-2 h-2 animate-bounce" />
                        <div className="bg-current rounded-full w-2 h-2 animate-bounce delay-75" />
                        <div className="bg-current rounded-full w-2 h-2 animate-bounce delay-150" />
                      </div>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          </CardContent>
          <CardFooter className="p-4 pt-2">
            <form onSubmit={handleSubmit} className="flex gap-2 w-full">
              <Input
                placeholder="Ask about your projects and tasks..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                disabled={isLoading}
                className="flex-1"
              />
              <Button type="submit" size="icon" disabled={isLoading}>
                <Send className="w-4 h-4" />
              </Button>
            </form>
          </CardFooter>
        </Card>
      </div>
    </>
  );
}