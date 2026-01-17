import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { trpc } from "@/lib/trpc";
import { format } from "date-fns";
import { LogOut, Zap } from "lucide-react";
import { useLocation } from "wouter";

export default function Profile() {
  const { user, logout } = useAuth();
  const [, navigate] = useLocation();
  
  const { data: balance, isLoading: balanceLoading } = trpc.tokens.getBalance.useQuery();
  const { data: transactions, isLoading: transactionsLoading } = trpc.tokens.getTransactions.useQuery({ limit: 20 });

  const handleLogout = async () => {
    await logout();
    navigate("/", { replace: true });
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white p-4 md:p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold">Profile</h1>
            <p className="text-slate-400 mt-2">Manage your account and tokens</p>
          </div>
          <Button
            onClick={handleLogout}
            variant="outline"
            className="gap-2"
          >
            <LogOut className="w-4 h-4" />
            Logout
          </Button>
        </div>

        <Separator className="bg-slate-700" />

        {/* User Info Card */}
        <Card className="bg-slate-800 border-slate-700">
          <CardHeader>
            <CardTitle>Account Information</CardTitle>
            <CardDescription>Your profile details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm text-slate-400">Name</label>
              <p className="text-lg font-semibold">{user.name || "Not set"}</p>
            </div>
            <div>
              <label className="text-sm text-slate-400">Email</label>
              <p className="text-lg font-semibold">{user.email || "Not set"}</p>
            </div>
            <div>
              <label className="text-sm text-slate-400">Member Since</label>
              <p className="text-lg font-semibold">
                {format(new Date(user.createdAt), "MMMM d, yyyy")}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Token Balance Card */}
        <Card className="bg-gradient-to-br from-blue-900 to-blue-800 border-blue-700">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="w-5 h-5" />
              Token Balance
            </CardTitle>
            <CardDescription>Your available credits</CardDescription>
          </CardHeader>
          <CardContent>
            {balanceLoading ? (
              <div className="animate-pulse h-12 bg-blue-700 rounded" />
            ) : (
              <div className="space-y-2">
                <div className="text-5xl font-bold">{balance?.balance || 0}</div>
                <p className="text-blue-200">
                  {balance?.totalAllocated || 0} total allocated
                </p>
                <div className="mt-4 pt-4 border-t border-blue-700">
                  <p className="text-sm text-blue-200">
                    Image Generation: 50 tokens | Video: 200 tokens | Upscale: 30 tokens | TTS: 20 tokens
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Token Usage History */}
        <Card className="bg-slate-800 border-slate-700">
          <CardHeader>
            <CardTitle>Recent Token Usage</CardTitle>
            <CardDescription>Your last 20 transactions</CardDescription>
          </CardHeader>
          <CardContent>
            {transactionsLoading ? (
              <div className="space-y-2">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="animate-pulse h-12 bg-slate-700 rounded" />
                ))}
              </div>
            ) : transactions && transactions.length > 0 ? (
              <div className="space-y-2">
                {transactions.map((tx) => (
                  <div
                    key={tx.id}
                    className="flex items-center justify-between p-3 bg-slate-700 rounded-lg hover:bg-slate-600 transition"
                  >
                    <div className="flex-1">
                      <p className="font-semibold capitalize">
                        {tx.type.replace(/_/g, " ")}
                      </p>
                      <p className="text-sm text-slate-400">
                        {format(new Date(tx.createdAt), "MMM d, yyyy HH:mm")}
                      </p>
                    </div>
                    <div className={`text-lg font-bold ${tx.amount < 0 ? "text-red-400" : "text-green-400"}`}>
                      {tx.amount > 0 ? "+" : ""}{tx.amount}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-slate-400 text-center py-8">No transactions yet</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
