import { useState } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/hooks/use-auth";
import { useLocation } from "wouter";
import { insertUserSchema } from "@shared/schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Loader2, ChartLine } from "lucide-react";

export default function AuthPage() {
  const { user, loginMutation, registerMutation } = useAuth();
  const [_, navigate] = useLocation();
  const [activeTab, setActiveTab] = useState<string>("login");

  // Redirect if already logged in
  if (user) {
    navigate("/");
    return null;
  }

  // Login form setup
  const loginForm = useForm({
    resolver: zodResolver(insertUserSchema),
    defaultValues: {
      username: "",
      password: ""
    }
  });

  // Register form setup
  const registerForm = useForm({
    resolver: zodResolver(insertUserSchema),
    defaultValues: {
      username: "",
      password: ""
    }
  });

  const onLoginSubmit = async (data: { username: string; password: string }) => {
    await loginMutation.mutateAsync(data);
  };

  const onRegisterSubmit = async (data: { username: string; password: string }) => {
    await registerMutation.mutateAsync(data);
  };

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-dark-800">
      <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="flex flex-col justify-center">
          <Tabs defaultValue={activeTab} onValueChange={setActiveTab} className="w-full max-w-md mx-auto">
            <div className="mb-8 text-center">
              <div className="flex items-center justify-center mb-3">
                <ChartLine className="h-8 w-8 text-primary-500 mr-2" />
                <h1 className="text-3xl font-bold text-white">TradeSmart</h1>
              </div>
              <p className="text-gray-400">Your simulated stock trading platform</p>
            </div>

            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="login">Login</TabsTrigger>
              <TabsTrigger value="register">Register</TabsTrigger>
            </TabsList>

            <TabsContent value="login">
              <Card className="bg-dark-700 border-dark-600">
                <CardHeader>
                  <CardTitle>Login to your account</CardTitle>
                  <CardDescription>Enter your credentials to access your portfolio</CardDescription>
                </CardHeader>
                <Form {...loginForm}>
                  <form onSubmit={loginForm.handleSubmit(onLoginSubmit)}>
                    <CardContent className="space-y-4">
                      <FormField
                        control={loginForm.control}
                        name="username"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Username</FormLabel>
                            <FormControl>
                              <Input placeholder="Enter your username" {...field} className="bg-dark-800 border-dark-600 text-white" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={loginForm.control}
                        name="password"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Password</FormLabel>
                            <FormControl>
                              <Input type="password" placeholder="Enter your password" {...field} className="bg-dark-800 border-dark-600 text-white" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </CardContent>
                    <CardFooter>
                      <Button type="submit" className="w-full" disabled={loginMutation.isPending}>
                        {loginMutation.isPending ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Logging in...
                          </>
                        ) : (
                          "Login"
                        )}
                      </Button>
                    </CardFooter>
                  </form>
                </Form>
              </Card>
            </TabsContent>

            <TabsContent value="register">
              <Card className="bg-dark-700 border-dark-600">
                <CardHeader>
                  <CardTitle>Create an account</CardTitle>
                  <CardDescription>Sign up to start trading with ₹100,000 virtual money</CardDescription>
                </CardHeader>
                <Form {...registerForm}>
                  <form onSubmit={registerForm.handleSubmit(onRegisterSubmit)}>
                    <CardContent className="space-y-4">
                      <FormField
                        control={registerForm.control}
                        name="username"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Username</FormLabel>
                            <FormControl>
                              <Input placeholder="Choose a username" {...field} className="bg-dark-800 border-dark-600 text-white" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={registerForm.control}
                        name="password"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Password</FormLabel>
                            <FormControl>
                              <Input type="password" placeholder="Choose a password" {...field} className="bg-dark-800 border-dark-600 text-white" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </CardContent>
                    <CardFooter>
                      <Button type="submit" className="w-full" disabled={registerMutation.isPending}>
                        {registerMutation.isPending ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Creating account...
                          </>
                        ) : (
                          "Register"
                        )}
                      </Button>
                    </CardFooter>
                  </form>
                </Form>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        <div className="hidden lg:flex flex-col justify-center">
          <div className="bg-dark-700 p-8 rounded-lg border border-dark-600">
            <h2 className="text-2xl font-bold mb-4">Welcome to TradeSmart</h2>
            <p className="text-gray-300 mb-6">
              Experience the thrill of stock trading without the risk. TradeSmart provides you with a realistic trading platform where you can:
            </p>
            <ul className="space-y-4">
              <li className="flex items-start">
                <div className="flex-shrink-0 h-6 w-6 rounded-full bg-primary-900 flex items-center justify-center mr-3">
                  <span className="text-xs text-primary-400">✓</span>
                </div>
                <p className="text-gray-300">Start with ₹100,000 in virtual money</p>
              </li>
              <li className="flex items-start">
                <div className="flex-shrink-0 h-6 w-6 rounded-full bg-primary-900 flex items-center justify-center mr-3">
                  <span className="text-xs text-primary-400">✓</span>
                </div>
                <p className="text-gray-300">Buy and sell stocks in real-time with simulated market data</p>
              </li>
              <li className="flex items-start">
                <div className="flex-shrink-0 h-6 w-6 rounded-full bg-primary-900 flex items-center justify-center mr-3">
                  <span className="text-xs text-primary-400">✓</span>
                </div>
                <p className="text-gray-300">Track your portfolio's performance over time</p>
              </li>
              <li className="flex items-start">
                <div className="flex-shrink-0 h-6 w-6 rounded-full bg-primary-900 flex items-center justify-center mr-3">
                  <span className="text-xs text-primary-400">✓</span>
                </div>
                <p className="text-gray-300">Compete with other traders on our leaderboard</p>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
