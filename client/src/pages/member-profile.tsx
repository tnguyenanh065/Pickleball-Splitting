import { useParams, Link } from "wouter";
import Layout from "@/components/layout";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchMemberLedger, settleDebt, updateMember } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Check, Copy, QrCode } from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { QRCodeSVG } from "qrcode.react";
import { formatDistanceToNow } from "date-fns";
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function MemberProfile() {
  const { id } = useParams<{ id: string }>();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [bankDialogOpen, setBankDialogOpen] = useState(false);
  const [bankName, setBankName] = useState("");
  const [bankAccount, setBankAccount] = useState("");

  const { data: ledger, isLoading } = useQuery({
    queryKey: ["member-ledger", id],
    queryFn: () => fetchMemberLedger(id!),
    enabled: !!id,
  });

  const settleMutation = useMutation({
    mutationFn: settleDebt,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["member-ledger"] });
      queryClient.invalidateQueries({ queryKey: ["debts"] });
      queryClient.invalidateQueries({ queryKey: ["sessions"] });
      queryClient.invalidateQueries({ queryKey: ["financial-summary"] });
      toast({ title: "Settled", description: "Payment marked as received." });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to settle debt.", variant: "destructive" });
    },
  });

  const updateBankMutation = useMutation({
    mutationFn: (data: { bankName: string; bankAccount: string }) => 
      updateMember(id!, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["member-ledger"] });
      toast({ title: "Updated", description: "Bank details saved." });
      setBankDialogOpen(false);
    },
  });

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
  };

  const generateVietQR = (bankAccount: string, bankName: string, amount: number, memo: string) => {
    return `${bankName}|${bankAccount}|${Math.round(amount)}|${memo}`;
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-muted rounded w-48" />
          <div className="h-32 bg-muted rounded" />
        </div>
      </Layout>
    );
  }

  if (!ledger) {
    return (
      <Layout>
        <div className="text-center py-12">
          <p className="text-muted-foreground">Member not found</p>
          <Link href="/">
            <Button variant="outline" className="mt-4">Go back</Button>
          </Link>
        </div>
      </Layout>
    );
  }

  const { member, summary, debtsOwed, debtsOwing } = ledger;
  const netPosition = parseFloat(summary.netPosition);

  return (
    <Layout>
      <div className="flex flex-col space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-12">
        <div className="flex items-center gap-4">
          <Link href="/">
            <Button variant="ghost" size="icon" data-testid="button-back">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div className="flex items-center gap-3">
            <Avatar className="h-12 w-12 border-2 border-border">
              <AvatarFallback className="text-lg font-medium bg-secondary">
                {member.initials}
              </AvatarFallback>
            </Avatar>
            <div>
              <h1 className="text-2xl font-display font-bold tracking-tight">{member.name}</h1>
              <p className="text-sm text-muted-foreground">Member Profile</p>
            </div>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <Card className={cn(
            "border-border/50",
            netPosition > 0 ? "bg-[hsl(var(--receiving))]/5" : netPosition < 0 ? "bg-[hsl(var(--paying))]/5" : ""
          )}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Net Position</CardTitle>
            </CardHeader>
            <CardContent>
              <div className={cn(
                "text-2xl font-bold font-mono",
                netPosition > 0 ? "text-[hsl(var(--receiving))]" : netPosition < 0 ? "text-[hsl(var(--paying))]" : ""
              )}>
                {netPosition > 0 ? "+" : ""}{formatCurrency(netPosition)}
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/50">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">To Receive</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold font-mono">{formatCurrency(parseFloat(summary.toReceive))}</div>
            </CardContent>
          </Card>

          <Card className="border-border/50">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">To Pay</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold font-mono">{formatCurrency(parseFloat(summary.toPay))}</div>
            </CardContent>
          </Card>
        </div>

        {debtsOwing.length > 0 && (
          <Card className="border-border/50">
            <CardHeader>
              <CardTitle className="text-lg font-display">You Owe</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {debtsOwing.map((debt) => (
                <div key={debt.id} className="flex items-center justify-between p-4 bg-secondary/30 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10 border border-border">
                      <AvatarFallback className="text-sm bg-background">
                        {debt.toMember.initials}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">{debt.toMember.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {formatDistanceToNow(new Date(debt.createdAt))} ago
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <div className="font-mono font-medium text-[hsl(var(--paying))]">
                        {formatCurrency(parseFloat(debt.amount))}
                      </div>
                    </div>
                    
                    {debt.toMember.bankAccount && (
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="outline" size="sm" data-testid={`button-qr-${debt.id}`}>
                            <QrCode className="h-4 w-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-xs">
                          <DialogHeader>
                            <DialogTitle>Transfer to {debt.toMember.name}</DialogTitle>
                          </DialogHeader>
                          <div className="flex flex-col items-center gap-4 py-4">
                            <div className="p-4 bg-white rounded-lg">
                              <QRCodeSVG 
                                value={generateVietQR(
                                  debt.toMember.bankAccount,
                                  debt.toMember.bankName || "",
                                  parseFloat(debt.amount),
                                  "Pickleball"
                                )} 
                                size={180}
                              />
                            </div>
                            <div className="text-center space-y-1">
                              <p className="font-mono text-lg font-bold">{formatCurrency(parseFloat(debt.amount))}</p>
                              <p className="text-sm text-muted-foreground">{debt.toMember.bankName}</p>
                              <div className="flex items-center justify-center gap-2">
                                <code className="text-sm bg-muted px-2 py-1 rounded">{debt.toMember.bankAccount}</code>
                                <Button 
                                  variant="ghost" 
                                  size="icon" 
                                  className="h-6 w-6"
                                  onClick={() => {
                                    navigator.clipboard.writeText(debt.toMember.bankAccount || "");
                                    toast({ title: "Copied" });
                                  }}
                                >
                                  <Copy className="h-3 w-3" />
                                </Button>
                              </div>
                            </div>
                          </div>
                        </DialogContent>
                      </Dialog>
                    )}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {debtsOwed.length > 0 && (
          <Card className="border-border/50">
            <CardHeader>
              <CardTitle className="text-lg font-display">Owes You</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {debtsOwed.map((debt) => (
                <div key={debt.id} className="flex items-center justify-between p-4 bg-secondary/30 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10 border border-border">
                      <AvatarFallback className="text-sm bg-background">
                        {debt.fromMember.initials}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">{debt.fromMember.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {formatDistanceToNow(new Date(debt.createdAt))} ago
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <div className="font-mono font-medium text-[hsl(var(--receiving))]">
                        {formatCurrency(parseFloat(debt.amount))}
                      </div>
                    </div>
                    
                    <Button 
                      size="sm"
                      variant="outline"
                      onClick={() => settleMutation.mutate(debt.id)}
                      disabled={settleMutation.isPending}
                      data-testid={`button-settle-${debt.id}`}
                      className="gap-1"
                    >
                      <Check className="h-3 w-3" />
                      Settled
                    </Button>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {debtsOwed.length === 0 && debtsOwing.length === 0 && (
          <Card className="border-border/50">
            <CardContent className="py-12 text-center text-muted-foreground">
              All settled up! No active debts.
            </CardContent>
          </Card>
        )}

        <Card className="border-border/50">
          <CardHeader>
            <CardTitle className="text-lg font-display">Bank Details</CardTitle>
          </CardHeader>
          <CardContent>
            {member.bankAccount ? (
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{member.bankName}</p>
                  <p className="font-mono">{member.bankAccount}</p>
                </div>
                <Dialog open={bankDialogOpen} onOpenChange={setBankDialogOpen}>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="sm">Edit</Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Update Bank Details</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={(e) => {
                      e.preventDefault();
                      updateBankMutation.mutate({ bankName, bankAccount });
                    }} className="space-y-4 pt-4">
                      <div className="space-y-2">
                        <Label>Bank Name</Label>
                        <Input 
                          value={bankName} 
                          onChange={(e) => setBankName(e.target.value)}
                          placeholder="e.g. Vietcombank"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Account Number</Label>
                        <Input 
                          value={bankAccount} 
                          onChange={(e) => setBankAccount(e.target.value)}
                          placeholder="e.g. 1234567890"
                        />
                      </div>
                      <Button type="submit" className="w-full" disabled={updateBankMutation.isPending}>
                        Save
                      </Button>
                    </form>
                  </DialogContent>
                </Dialog>
              </div>
            ) : (
              <Dialog open={bankDialogOpen} onOpenChange={setBankDialogOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" data-testid="button-add-bank">
                    Add Bank Details
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Add Bank Details</DialogTitle>
                  </DialogHeader>
                  <form onSubmit={(e) => {
                    e.preventDefault();
                    updateBankMutation.mutate({ bankName, bankAccount });
                  }} className="space-y-4 pt-4">
                    <div className="space-y-2">
                      <Label>Bank Name</Label>
                      <Input 
                        value={bankName} 
                        onChange={(e) => setBankName(e.target.value)}
                        placeholder="e.g. Vietcombank"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Account Number</Label>
                      <Input 
                        value={bankAccount} 
                        onChange={(e) => setBankAccount(e.target.value)}
                        placeholder="e.g. 1234567890"
                      />
                    </div>
                    <Button type="submit" className="w-full" disabled={updateBankMutation.isPending}>
                      Save
                    </Button>
                  </form>
                </DialogContent>
              </Dialog>
            )}
            <p className="text-xs text-muted-foreground mt-2">
              Others can scan your QR code to transfer money.
            </p>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
