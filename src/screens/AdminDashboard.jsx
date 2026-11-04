"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Leaf,
  Snowflake,
  LogOut,
  Users,
  Eye,
  TrendingUp,
  Download,
  MoreVertical,
  Trash2,
  RefreshCw,
  Phone,
  Mail,
  Megaphone,
  Save,
  FileText,
  Plus,
  ArrowRightLeft,
  XCircle,
  ChevronRight,
  Send,
  MessageSquare,
  Banknote,
} from "lucide-react";
import { toast } from "sonner";
import axios from "axios";
import { BUSINESS_NAME } from "@/lib/brand";
import { serviceShortLabel } from "@/lib/services";

const API = "/api";

const getStatusColor = (status) =>
  ({
    new: "bg-blue-100 text-blue-800",
    contacted: "bg-yellow-100 text-yellow-800",
    qualified: "bg-purple-100 text-purple-800",
    converted: "bg-green-100 text-green-800",
    won: "bg-emerald-100 text-emerald-800",
    lost: "bg-red-100 text-red-800",
    closed: "bg-gray-100 text-gray-800",
  }[status] || "bg-gray-100 text-gray-800");

const getPriorityColor = (priority) =>
  ({
    low: "bg-slate-100 text-slate-700",
    medium: "bg-blue-100 text-blue-700",
    high: "bg-orange-100 text-orange-700",
    urgent: "bg-red-100 text-red-700",
  }[priority] || "bg-gray-100 text-gray-800");

const getInvoiceStatusColor = (status) =>
  ({
    draft: "bg-gray-100 text-gray-700",
    sent: "bg-blue-100 text-blue-700",
    accepted: "bg-green-100 text-green-700",
    declined: "bg-red-100 text-red-700",
    paid: "bg-emerald-100 text-emerald-700",
    overdue: "bg-orange-100 text-orange-700",
    cancelled: "bg-slate-100 text-slate-700",
  }[status] || "bg-gray-100 text-gray-800");

const LEAD_STATUSES = ["new", "contacted", "qualified", "converted", "won", "lost", "closed"];
const PRIORITIES = ["low", "medium", "high", "urgent"];
const INVOICE_STATUSES = ["draft", "sent", "accepted", "declined", "paid", "overdue", "cancelled"];

const BLANK_INVOICE_FORM = {
  lead_id: "",
  client_name: "",
  client_email: "",
  client_phone: "",
  client_address: "",
  due_date: "",
  tax_rate: 13,
  notes: "",
  items: [{ description: "", quantity: 1, unit_price: 0 }],
};

const money = (value) => `$${Number(value || 0).toFixed(2)}`;

const AdminDashboard = () => {
  const router = useRouter();
  const [leads, setLeads] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const [promoSettings, setPromoSettings] = useState({
    enabled: true,
    title: "",
    subtitle: "",
    discount_text: "",
    cta_text: "",
    deadline_date: "",
  });
  const [isSavingPromo, setIsSavingPromo] = useState(false);
  const [snowContractSeason, setSnowContractSeason] = useState(false);
  const [isSavingSeason, setIsSavingSeason] = useState(false);

  const [leadFilter, setLeadFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [selectedLead, setSelectedLead] = useState(null);
  const [showLeadDetail, setShowLeadDetail] = useState(false);
  const [leadComments, setLeadComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [isSavingComment, setIsSavingComment] = useState(false);

  const [showInvoiceForm, setShowInvoiceForm] = useState(false);
  const [invoiceType, setInvoiceType] = useState("estimate");
  const [invoiceForm, setInvoiceForm] = useState(BLANK_INVOICE_FORM);
  const [isSavingInvoice, setIsSavingInvoice] = useState(false);
  const [invoiceFilter, setInvoiceFilter] = useState("all");
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [showInvoiceDetail, setShowInvoiceDetail] = useState(false);
  const [isSendingEmail, setIsSendingEmail] = useState(false);
  const [sendEmailTo, setSendEmailTo] = useState("");

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [leadsRes, analyticsRes, promoRes, seasonRes, invoicesRes] = await Promise.all([
        axios.get(`${API}/admin/leads`),
        axios.get(`${API}/admin/analytics`),
        axios.get(`${API}/admin/promo-banner`),
        axios.get(`${API}/admin/site-settings`),
        axios.get(`${API}/admin/invoices`),
      ]);
      setLeads(leadsRes.data);
      setAnalytics(analyticsRes.data);
      setPromoSettings(promoRes.data);
      setSnowContractSeason(Boolean(seasonRes.data.snowContractSeason));
      setInvoices(invoicesRes.data);
    } catch (error) {
      console.error("Error fetching data:", error);
      if (error.response?.status === 401) {
        router.push("/admin/login");
      } else {
        toast.error("Failed to load data");
      }
    } finally {
      setIsLoading(false);
    }
  }, [router]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleLogout = () => {
    axios
      .post(`${API}/auth/logout`)
      .catch(() => {})
      .finally(() => router.push("/admin/login"));
  };

  const handleStatusChange = async (leadId, newStatus) => {
    try {
      await axios.patch(`${API}/admin/leads/${leadId}/status?status=${newStatus}`);
      setLeads((prev) => prev.map((l) => (l.id === leadId ? { ...l, status: newStatus } : l)));
      if (selectedLead?.id === leadId) {
        setSelectedLead((prev) => ({ ...prev, status: newStatus }));
      }
      toast.success("Status updated");
    } catch {
      toast.error("Failed to update status");
    }
  };

  const handlePriorityChange = async (leadId, newPriority) => {
    try {
      await axios.patch(`${API}/admin/leads/${leadId}`, { priority: newPriority });
      setLeads((prev) => prev.map((l) => (l.id === leadId ? { ...l, priority: newPriority } : l)));
      if (selectedLead?.id === leadId) {
        setSelectedLead((prev) => ({ ...prev, priority: newPriority }));
      }
      toast.success("Priority updated");
    } catch {
      toast.error("Failed to update priority");
    }
  };

  const handleDeleteLead = async (leadId) => {
    if (!window.confirm("Delete this lead? This cannot be undone.")) return;
    try {
      await axios.delete(`${API}/admin/leads/${leadId}`);
      setLeads((prev) => prev.filter((l) => l.id !== leadId));
      toast.success("Lead deleted");
    } catch {
      toast.error("Failed to delete lead");
    }
  };

  const handleExport = async () => {
    try {
      const response = await axios.get(`${API}/admin/leads/export`);
      const blob = new Blob([response.data.csv], { type: "text/csv" });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = response.data.filename;
      a.click();
      window.URL.revokeObjectURL(url);
      toast.success("Export downloaded");
    } catch {
      toast.error("Failed to export leads");
    }
  };

  const loadLeadComments = async (leadId) => {
    try {
      const res = await axios.get(`${API}/admin/leads/${leadId}/comments`);
      setLeadComments(res.data);
    } catch {
      setLeadComments([]);
      toast.error("Failed to load comments");
    }
  };

  const openLeadDetail = async (lead) => {
    setSelectedLead(lead);
    setNewComment("");
    setShowLeadDetail(true);
    await loadLeadComments(lead.id);
  };

  const handleAddComment = async () => {
    if (!selectedLead || !newComment.trim()) return;
    setIsSavingComment(true);
    try {
      const res = await axios.post(`${API}/admin/leads/${selectedLead.id}/comments`, {
        body: newComment.trim(),
      });
      setLeadComments((prev) => [res.data, ...prev]);
      setNewComment("");
      toast.success("Comment added");
    } catch {
      toast.error("Failed to add comment");
    } finally {
      setIsSavingComment(false);
    }
  };

  const handleDeleteComment = async (commentId) => {
    if (!selectedLead) return;
    if (!window.confirm("Delete this comment?")) return;
    try {
      await axios.delete(`${API}/admin/leads/${selectedLead.id}/comments/${commentId}`);
      setLeadComments((prev) => prev.filter((c) => c.id !== commentId));
      toast.success("Comment deleted");
    } catch {
      toast.error("Failed to delete comment");
    }
  };

  const openInvoiceFormForLead = (lead, type = "estimate") => {
    setInvoiceForm({
      lead_id: lead.id,
      client_name: lead.name || "",
      client_email: lead.email || "",
      client_phone: lead.phone || "",
      client_address: "",
      due_date: "",
      tax_rate: 13,
      notes: "",
      items: [
        {
          description: serviceShortLabel(lead.service_type) || "Service",
          quantity: 1,
          unit_price: 0,
        },
      ],
    });
    setInvoiceType(type);
    setShowLeadDetail(false);
    setShowInvoiceForm(true);
  };

  const handleCreateInvoice = async () => {
    if (!invoiceForm.client_name.trim()) {
      toast.error("Client name is required");
      return;
    }
    if (invoiceForm.items.some((item) => !item.description.trim())) {
      toast.error("All items need a description");
      return;
    }
    setIsSavingInvoice(true);
    try {
      const payload = {
        ...invoiceForm,
        type: invoiceType,
        lead_id: invoiceForm.lead_id || null,
        client_email: invoiceForm.client_email || null,
        items: invoiceForm.items.map((item) => ({
          description: item.description,
          quantity: Number(item.quantity) || 1,
          unit_price: Number(item.unit_price) || 0,
        })),
        tax_rate: Number(invoiceForm.tax_rate) || 0,
      };
      const res = await axios.post(`${API}/admin/invoices`, payload);
      toast.success(
        `${invoiceType === "invoice" ? "Invoice" : "Estimate"} ${res.data.invoice_number} created`
      );
      setShowInvoiceForm(false);
      setInvoiceForm(BLANK_INVOICE_FORM);
      await fetchData();
    } catch {
      toast.error(`Failed to create ${invoiceType}`);
    } finally {
      setIsSavingInvoice(false);
    }
  };

  const handleInvoiceStatusChange = async (invoiceId, newStatus, paymentMethod = null) => {
    try {
      await axios.patch(
        `${API}/admin/invoices/${invoiceId}/status?status=${newStatus}`,
        newStatus === "paid" && paymentMethod ? { payment_method: paymentMethod } : {}
      );
      setInvoices((prev) =>
        prev.map((inv) =>
          inv.id === invoiceId
            ? {
                ...inv,
                status: newStatus,
                payment_method: newStatus === "paid" ? paymentMethod : null,
              }
            : inv
        )
      );
      if (selectedInvoice?.id === invoiceId) {
        setSelectedInvoice((prev) => ({
          ...prev,
          status: newStatus,
          payment_method: newStatus === "paid" ? paymentMethod : null,
        }));
      }
      toast.success("Status updated");
    } catch {
      toast.error("Failed to update status");
    }
  };

  const markInvoicePaid = async (invoiceId) => {
    const method = window.prompt(
      'Mark as paid. Enter payment method: "cash" or "etransfer"',
      "etransfer"
    );
    if (method === null) return;
    const normalized = method.trim().toLowerCase();
    if (normalized !== "cash" && normalized !== "etransfer") {
      toast.error('Payment method must be "cash" or "etransfer"');
      return;
    }
    await handleInvoiceStatusChange(invoiceId, "paid", normalized);
  };

  const handleConvertEstimateToInvoice = async (invoiceId) => {
    try {
      const res = await axios.post(`${API}/admin/invoices/${invoiceId}/convert`);
      toast.success(`Converted to invoice ${res.data.invoice_number}`);
      await fetchData();
      setShowInvoiceDetail(false);
    } catch {
      toast.error("Failed to convert estimate");
    }
  };

  const handleDeleteInvoice = async (invoiceId) => {
    if (!window.confirm("Delete this document? This cannot be undone.")) return;
    try {
      await axios.delete(`${API}/admin/invoices/${invoiceId}`);
      setInvoices((prev) => prev.filter((inv) => inv.id !== invoiceId));
      if (selectedInvoice?.id === invoiceId) setShowInvoiceDetail(false);
      toast.success("Deleted");
    } catch {
      toast.error("Failed to delete");
    }
  };

  const openInvoiceDetail = async (inv) => {
    try {
      const res = await axios.get(`${API}/admin/invoices/${inv.id}`);
      setSelectedInvoice(res.data);
      setSendEmailTo(res.data.client_email || "");
      setShowInvoiceDetail(true);
    } catch {
      toast.error("Failed to load invoice details");
    }
  };

  const handleSendEmail = async (invoiceId, overrideTo) => {
    setIsSendingEmail(true);
    try {
      const payload = overrideTo ? { to: overrideTo } : {};
      await axios.post(`${API}/admin/invoices/${invoiceId}/send`, payload);
      toast.success(`Email sent to ${overrideTo || selectedInvoice?.client_email}`);
      setInvoices((prev) =>
        prev.map((inv) =>
          inv.id === invoiceId && inv.status === "draft" ? { ...inv, status: "sent" } : inv
        )
      );
      if (selectedInvoice?.id === invoiceId && selectedInvoice?.status === "draft") {
        setSelectedInvoice((prev) => ({ ...prev, status: "sent" }));
      }
    } catch (err) {
      toast.error(err.response?.data?.error || "Failed to send email");
    } finally {
      setIsSendingEmail(false);
    }
  };

  const addInvoiceItem = () =>
    setInvoiceForm((prev) => ({
      ...prev,
      items: [...prev.items, { description: "", quantity: 1, unit_price: 0 }],
    }));

  const removeInvoiceItem = (index) => {
    if (invoiceForm.items.length <= 1) return;
    setInvoiceForm((prev) => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index),
    }));
  };

  const updateInvoiceItem = (index, field, value) => {
    setInvoiceForm((prev) => {
      const items = [...prev.items];
      items[index] = { ...items[index], [field]: value };
      return { ...prev, items };
    });
  };

  const handleSavePromo = async () => {
    setIsSavingPromo(true);
    try {
      await axios.put(`${API}/admin/promo-banner`, promoSettings);
      toast.success("Promo banner settings saved!");
    } catch {
      toast.error("Failed to save promo settings");
    } finally {
      setIsSavingPromo(false);
    }
  };

  const handleSnowSeasonChange = async (checked) => {
    const previous = snowContractSeason;
    setSnowContractSeason(checked);
    setIsSavingSeason(true);
    try {
      await axios.put(`${API}/admin/site-settings`, { snowContractSeason: checked });
      toast.success(
        checked
          ? "Snow contract season is on. The public site updates on the next visit."
          : "Snow contract season is off. The landscaping site returns on the next visit."
      );
    } catch {
      setSnowContractSeason(previous);
      toast.error("Failed to update snow contract season");
    } finally {
      setIsSavingSeason(false);
    }
  };

  const filteredLeads = leads.filter((lead) => {
    if (leadFilter !== "all" && lead.status !== leadFilter) return false;
    if (priorityFilter !== "all" && lead.priority !== priorityFilter) return false;
    return true;
  });

  const filteredInvoices = invoices.filter((inv) => {
    if (invoiceFilter === "all") return true;
    if (invoiceFilter === "invoice" || invoiceFilter === "estimate") return inv.type === invoiceFilter;
    return inv.status === invoiceFilter;
  });

  const invoiceSubtotal = invoiceForm.items.reduce(
    (sum, item) => sum + (Number(item.quantity) || 0) * (Number(item.unit_price) || 0),
    0
  );
  const invoiceTax = invoiceSubtotal * ((Number(invoiceForm.tax_rate) || 0) / 100);
  const invoiceTotal = invoiceSubtotal + invoiceTax;
  const getLeadInvoices = (leadId) => invoices.filter((inv) => inv.lead_id === leadId);

  const leadRowActions = (lead) => (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="h-8 w-8 shrink-0 p-0"
          data-testid={`lead-actions-${lead.id}`}
        >
          <MoreVertical className="w-4 h-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => openLeadDetail(lead)} className="font-body">
          <MessageSquare className="w-4 h-4 mr-2" />
          Open / Comments
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => openInvoiceFormForLead(lead, "estimate")}
          className="font-body"
        >
          <FileText className="w-4 h-4 mr-2" />
          Create Estimate
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => handleDeleteLead(lead.id)}
          className="text-destructive font-body"
        >
          <Trash2 className="w-4 h-4 mr-2" />
          Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );

  return (
    <div className="min-h-screen overflow-x-hidden bg-muted/30" data-testid="admin-dashboard">
      <header className="bg-primary text-primary-foreground shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap items-center justify-between gap-3 py-3">
            <div className="flex min-w-0 items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-secondary">
                <Leaf className="w-5 h-5 text-primary" />
              </div>
              <div className="min-w-0">
                <h1 className="font-heading text-base leading-tight sm:text-xl">{BUSINESS_NAME}</h1>
                <p className="text-xs text-primary-foreground/70 font-body">Admin Dashboard</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={fetchData}
                className="text-primary-foreground hover:bg-primary-foreground/10"
                data-testid="refresh-btn"
              >
                <RefreshCw className="w-4 h-4 sm:mr-2" />
                <span className="hidden sm:inline">Refresh</span>
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleLogout}
                className="text-primary-foreground hover:bg-primary-foreground/10"
                data-testid="logout-btn"
              >
                <LogOut className="w-4 h-4 sm:mr-2" />
                <span className="hidden sm:inline">Logout</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto min-w-0 px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
          </div>
        ) : (
          <Tabs defaultValue="overview" className="space-y-6">
            <TabsList className="flex h-auto w-full flex-wrap justify-start gap-1">
              <TabsTrigger value="overview" className="font-body">
                Overview
              </TabsTrigger>
              <TabsTrigger value="leads" className="font-body">
                Leads
              </TabsTrigger>
              <TabsTrigger value="invoices" className="font-body">
                Invoices & Estimates
              </TabsTrigger>
              <TabsTrigger value="promo" className="font-body">
                Promo Banner
              </TabsTrigger>
              <TabsTrigger value="season" className="font-body">
                Snow Season
              </TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              {analytics && (
                <>
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    <Card>
                      <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-body text-sm text-muted-foreground">Total Leads</p>
                            <p className="font-heading text-3xl">{analytics.total_leads}</p>
                          </div>
                          <Users className="w-8 h-8 text-primary/40" />
                        </div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-body text-sm text-muted-foreground">Page Views</p>
                            <p className="font-heading text-3xl">{analytics.total_page_views}</p>
                          </div>
                          <Eye className="w-8 h-8 text-primary/40" />
                        </div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-body text-sm text-muted-foreground">Conversion</p>
                            <p className="font-heading text-3xl">{analytics.conversion_rate}%</p>
                          </div>
                          <TrendingUp className="w-8 h-8 text-primary/40" />
                        </div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-body text-sm text-muted-foreground">Documents</p>
                            <p className="font-heading text-3xl">{invoices.length}</p>
                            <p className="font-body text-xs text-muted-foreground mt-1">
                              {invoices.filter((i) => i.type === "estimate").length} estimates ·{" "}
                              {invoices.filter((i) => i.type === "invoice").length} invoices
                            </p>
                          </div>
                          <FileText className="w-8 h-8 text-primary/40" />
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  {analytics.daily_stats?.length > 0 && (
                    <Card>
                      <CardHeader>
                        <CardTitle className="font-heading text-lg">Last 7 Days</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="flex items-end justify-between gap-2 h-40">
                          {analytics.daily_stats.map((day) => {
                            const maxViews = Math.max(
                              ...analytics.daily_stats.map((d) => d.visitors || 0),
                              1
                            );
                            const maxLeads = Math.max(
                              ...analytics.daily_stats.map((d) => d.leads || 0),
                              1
                            );
                            return (
                              <div
                                key={day.date}
                                className="flex flex-1 flex-col items-center gap-1"
                              >
                                <div className="flex h-28 w-full items-end justify-center gap-1">
                                  <div
                                    className="w-2 rounded-t bg-primary/20"
                                    style={{
                                      height: `${Math.max(
                                        ((day.visitors || 0) / maxViews) * 100,
                                        4
                                      )}%`,
                                    }}
                                  />
                                  <div
                                    className="w-2 rounded-t bg-primary"
                                    style={{
                                      height: `${Math.max(
                                        ((day.leads || 0) / maxLeads) * 100,
                                        4
                                      )}%`,
                                    }}
                                  />
                                </div>
                                <span className="text-xs text-muted-foreground font-body">
                                  {new Date(day.date).toLocaleDateString("en-US", {
                                    weekday: "short",
                                  })}
                                </span>
                                <span className="text-xs font-body font-medium">{day.leads}</span>
                              </div>
                            );
                          })}
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </>
              )}
            </TabsContent>

            <TabsContent value="leads">
              <Card data-testid="leads-table-card">
                <CardHeader className="flex flex-col gap-3 space-y-0 sm:flex-row sm:items-center sm:justify-between">
                  <CardTitle className="font-heading text-lg">
                    All Leads ({filteredLeads.length})
                  </CardTitle>
                  <div className="flex flex-wrap gap-2">
                    <Select value={leadFilter} onValueChange={setLeadFilter}>
                      <SelectTrigger className="h-8 w-[130px] font-body text-xs">
                        <SelectValue placeholder="Status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all" className="font-body text-xs">
                          All statuses
                        </SelectItem>
                        {LEAD_STATUSES.map((status) => (
                          <SelectItem
                            key={status}
                            value={status}
                            className="font-body text-xs capitalize"
                          >
                            {status}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                      <SelectTrigger className="h-8 w-[130px] font-body text-xs">
                        <SelectValue placeholder="Priority" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all" className="font-body text-xs">
                          All priorities
                        </SelectItem>
                        {PRIORITIES.map((priority) => (
                          <SelectItem
                            key={priority}
                            value={priority}
                            className="font-body text-xs capitalize"
                          >
                            {priority}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Button
                      onClick={handleExport}
                      variant="outline"
                      size="sm"
                      className="font-body"
                      data-testid="export-btn"
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Export CSV
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="min-w-0">
                  {filteredLeads.length === 0 ? (
                    <div className="text-center py-12">
                      <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                      <p className="font-body text-muted-foreground">
                        No leads match these filters.
                      </p>
                    </div>
                  ) : (
                    <>
                      <div className="space-y-3 md:hidden">
                        {filteredLeads.map((lead) => (
                          <article
                            key={lead.id}
                            className="space-y-3 rounded-lg border p-4"
                            data-testid={`lead-card-${lead.id}`}
                          >
                            <div className="flex items-start justify-between gap-3">
                              <button
                                type="button"
                                className="min-w-0 text-left"
                                onClick={() => openLeadDetail(lead)}
                              >
                                <h3 className="break-words font-body font-semibold text-foreground">
                                  {lead.name}
                                </h3>
                              </button>
                              {leadRowActions(lead)}
                            </div>
                            <div className="space-y-1">
                              <a
                                href={`mailto:${lead.email}`}
                                className="flex min-w-0 items-center gap-2 break-all text-sm font-body text-muted-foreground"
                              >
                                <Mail className="w-3 h-3 shrink-0" />
                                {lead.email}
                              </a>
                              <a
                                href={`tel:${lead.phone}`}
                                className="flex items-center gap-2 text-sm font-body text-muted-foreground"
                              >
                                <Phone className="w-3 h-3 shrink-0" />
                                {lead.phone}
                              </a>
                            </div>
                            <p className="break-words font-body text-sm">
                              <span className="text-muted-foreground">Service: </span>
                              {serviceShortLabel(lead.service_type)}
                            </p>
                            <div className="grid grid-cols-2 gap-2">
                              <Select
                                value={lead.status}
                                onValueChange={(value) => handleStatusChange(lead.id, value)}
                              >
                                <SelectTrigger
                                  className={`h-8 w-full text-xs font-body ${getStatusColor(
                                    lead.status
                                  )}`}
                                >
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  {LEAD_STATUSES.map((status) => (
                                    <SelectItem
                                      key={status}
                                      value={status}
                                      className="font-body text-xs capitalize"
                                    >
                                      {status}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <Select
                                value={lead.priority || "medium"}
                                onValueChange={(value) => handlePriorityChange(lead.id, value)}
                              >
                                <SelectTrigger
                                  className={`h-8 w-full text-xs font-body ${getPriorityColor(
                                    lead.priority
                                  )}`}
                                >
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  {PRIORITIES.map((priority) => (
                                    <SelectItem
                                      key={priority}
                                      value={priority}
                                      className="font-body text-xs capitalize"
                                    >
                                      {priority}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                          </article>
                        ))}
                      </div>

                      <div className="hidden overflow-x-auto md:block">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead className="font-body font-semibold">Name</TableHead>
                              <TableHead className="font-body font-semibold">Contact</TableHead>
                              <TableHead className="font-body font-semibold">Service</TableHead>
                              <TableHead className="font-body font-semibold">Status</TableHead>
                              <TableHead className="font-body font-semibold">Priority</TableHead>
                              <TableHead className="font-body font-semibold">Date</TableHead>
                              <TableHead className="font-body font-semibold w-[50px]">
                                Actions
                              </TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {filteredLeads.map((lead) => (
                              <TableRow
                                key={lead.id}
                                data-testid={`lead-row-${lead.id}`}
                                className="cursor-pointer"
                                onClick={() => openLeadDetail(lead)}
                              >
                                <TableCell className="font-body font-medium">
                                  {lead.name}
                                </TableCell>
                                <TableCell onClick={(e) => e.stopPropagation()}>
                                  <div className="flex flex-col gap-1">
                                    <a
                                      href={`mailto:${lead.email}`}
                                      className="flex items-center gap-1 text-sm font-body text-muted-foreground hover:text-primary"
                                    >
                                      <Mail className="w-3 h-3" />
                                      {lead.email}
                                    </a>
                                    <a
                                      href={`tel:${lead.phone}`}
                                      className="flex items-center gap-1 text-sm font-body text-muted-foreground hover:text-primary"
                                    >
                                      <Phone className="w-3 h-3" />
                                      {lead.phone}
                                    </a>
                                  </div>
                                </TableCell>
                                <TableCell className="font-body">
                                  {serviceShortLabel(lead.service_type)}
                                </TableCell>
                                <TableCell onClick={(e) => e.stopPropagation()}>
                                  <Select
                                    value={lead.status}
                                    onValueChange={(value) => handleStatusChange(lead.id, value)}
                                  >
                                    <SelectTrigger
                                      className={`w-[130px] h-8 text-xs font-body ${getStatusColor(
                                        lead.status
                                      )}`}
                                    >
                                      <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                      {LEAD_STATUSES.map((status) => (
                                        <SelectItem
                                          key={status}
                                          value={status}
                                          className="font-body text-xs capitalize"
                                        >
                                          {status}
                                        </SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                </TableCell>
                                <TableCell onClick={(e) => e.stopPropagation()}>
                                  <Select
                                    value={lead.priority || "medium"}
                                    onValueChange={(value) =>
                                      handlePriorityChange(lead.id, value)
                                    }
                                  >
                                    <SelectTrigger
                                      className={`w-[110px] h-8 text-xs font-body ${getPriorityColor(
                                        lead.priority
                                      )}`}
                                    >
                                      <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                      {PRIORITIES.map((priority) => (
                                        <SelectItem
                                          key={priority}
                                          value={priority}
                                          className="font-body text-xs capitalize"
                                        >
                                          {priority}
                                        </SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                </TableCell>
                                <TableCell className="font-body text-sm text-muted-foreground">
                                  {new Date(lead.created_at).toLocaleDateString()}
                                </TableCell>
                                <TableCell onClick={(e) => e.stopPropagation()}>
                                  {leadRowActions(lead)}
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="invoices">
              <Card>
                <CardHeader className="flex flex-col gap-3 space-y-0 sm:flex-row sm:items-center sm:justify-between">
                  <CardTitle className="font-heading text-lg">
                    Invoices & Estimates ({filteredInvoices.length})
                  </CardTitle>
                  <div className="flex flex-wrap gap-2">
                    <Select value={invoiceFilter} onValueChange={setInvoiceFilter}>
                      <SelectTrigger className="h-8 w-[140px] font-body text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all" className="font-body text-xs">
                          All
                        </SelectItem>
                        <SelectItem value="estimate" className="font-body text-xs">
                          Estimates
                        </SelectItem>
                        <SelectItem value="invoice" className="font-body text-xs">
                          Invoices
                        </SelectItem>
                        {INVOICE_STATUSES.map((status) => (
                          <SelectItem
                            key={status}
                            value={status}
                            className="font-body text-xs capitalize"
                          >
                            {status}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Button
                      onClick={() => {
                        setInvoiceType("estimate");
                        setInvoiceForm(BLANK_INVOICE_FORM);
                        setShowInvoiceForm(true);
                      }}
                      variant="outline"
                      size="sm"
                      className="font-body"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Estimate
                    </Button>
                    <Button
                      onClick={() => {
                        setInvoiceType("invoice");
                        setInvoiceForm(BLANK_INVOICE_FORM);
                        setShowInvoiceForm(true);
                      }}
                      size="sm"
                      className="font-body"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Invoice
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  {filteredInvoices.length === 0 ? (
                    <div className="text-center py-12">
                      <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                      <p className="font-body text-muted-foreground">
                        No invoices or estimates yet.
                      </p>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead className="font-body font-semibold">Number</TableHead>
                            <TableHead className="font-body font-semibold">Type</TableHead>
                            <TableHead className="font-body font-semibold">Client</TableHead>
                            <TableHead className="font-body font-semibold">Total</TableHead>
                            <TableHead className="font-body font-semibold">Status</TableHead>
                            <TableHead className="font-body font-semibold">Payment</TableHead>
                            <TableHead className="font-body font-semibold w-[50px]">
                              Actions
                            </TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {filteredInvoices.map((inv) => (
                            <TableRow
                              key={inv.id}
                              className="cursor-pointer"
                              onClick={() => openInvoiceDetail(inv)}
                            >
                              <TableCell className="font-body font-medium">
                                {inv.invoice_number}
                              </TableCell>
                              <TableCell>
                                <Badge variant="outline" className="font-body text-xs capitalize">
                                  {inv.type}
                                </Badge>
                              </TableCell>
                              <TableCell className="font-body">{inv.client_name}</TableCell>
                              <TableCell className="font-body">{money(inv.total)}</TableCell>
                              <TableCell>
                                <Badge
                                  className={`font-body text-xs capitalize ${getInvoiceStatusColor(
                                    inv.status
                                  )}`}
                                >
                                  {inv.status}
                                </Badge>
                              </TableCell>
                              <TableCell className="font-body text-xs capitalize text-muted-foreground">
                                {inv.payment_method || "—"}
                              </TableCell>
                              <TableCell onClick={(e) => e.stopPropagation()}>
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                      <MoreVertical className="w-4 h-4" />
                                    </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="end">
                                    <DropdownMenuItem
                                      onClick={() => openInvoiceDetail(inv)}
                                      className="font-body"
                                    >
                                      View
                                    </DropdownMenuItem>
                                    {inv.type === "estimate" && (
                                      <DropdownMenuItem
                                        onClick={() => handleConvertEstimateToInvoice(inv.id)}
                                        className="font-body"
                                      >
                                        <ArrowRightLeft className="w-4 h-4 mr-2" />
                                        Convert to Invoice
                                      </DropdownMenuItem>
                                    )}
                                    {inv.status !== "paid" && (
                                      <DropdownMenuItem
                                        onClick={() => markInvoicePaid(inv.id)}
                                        className="font-body"
                                      >
                                        <Banknote className="w-4 h-4 mr-2" />
                                        Mark Paid
                                      </DropdownMenuItem>
                                    )}
                                    <DropdownMenuItem
                                      onClick={() => handleDeleteInvoice(inv.id)}
                                      className="text-destructive font-body"
                                    >
                                      <Trash2 className="w-4 h-4 mr-2" />
                                      Delete
                                    </DropdownMenuItem>
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="promo">
              <Card data-testid="promo-settings-card">
                <CardHeader>
                  <CardTitle className="font-heading text-lg flex items-center gap-2">
                    <Megaphone className="w-5 h-5" />
                    Promotional Banner Settings
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex flex-col gap-4 p-4 bg-muted/50 rounded-lg sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <Label className="font-body font-semibold text-foreground">
                        Enable Promo Banner
                      </Label>
                      <p className="text-sm text-muted-foreground font-body">
                        Show the promotional banner on the website
                      </p>
                    </div>
                    <Switch
                      checked={promoSettings.enabled}
                      onCheckedChange={(checked) =>
                        setPromoSettings({ ...promoSettings, enabled: checked })
                      }
                      data-testid="promo-enabled-switch"
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="promo-title" className="font-body font-medium">
                        Title
                      </Label>
                      <Input
                        id="promo-title"
                        value={promoSettings.title}
                        onChange={(e) =>
                          setPromoSettings({ ...promoSettings, title: e.target.value })
                        }
                        className="font-body"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="promo-subtitle" className="font-body font-medium">
                        Subtitle
                      </Label>
                      <Input
                        id="promo-subtitle"
                        value={promoSettings.subtitle}
                        onChange={(e) =>
                          setPromoSettings({ ...promoSettings, subtitle: e.target.value })
                        }
                        className="font-body"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="promo-cta" className="font-body font-medium">
                        Button Text
                      </Label>
                      <Input
                        id="promo-cta"
                        value={promoSettings.cta_text}
                        onChange={(e) =>
                          setPromoSettings({ ...promoSettings, cta_text: e.target.value })
                        }
                        className="font-body"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="promo-deadline" className="font-body font-medium">
                        Countdown Deadline
                      </Label>
                      <Input
                        id="promo-deadline"
                        type="date"
                        value={promoSettings.deadline_date}
                        onChange={(e) =>
                          setPromoSettings({
                            ...promoSettings,
                            deadline_date: e.target.value,
                          })
                        }
                        className="font-body"
                      />
                    </div>
                  </div>
                  <div className="flex justify-end pt-4 border-t">
                    <Button
                      onClick={handleSavePromo}
                      disabled={isSavingPromo}
                      className="font-body"
                    >
                      <Save className="w-4 h-4 mr-2" />
                      {isSavingPromo ? "Saving..." : "Save Changes"}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="season">
              <Card data-testid="snow-season-card">
                <CardHeader>
                  <CardTitle className="font-heading text-lg flex items-center gap-2">
                    <Snowflake className="w-5 h-5" />
                    Snow Contract Season
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex flex-col gap-4 p-4 bg-muted/50 rounded-lg sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <Label
                        htmlFor="snow-season-switch"
                        className="font-body font-semibold text-foreground"
                      >
                        Snow Contract Season
                      </Label>
                      <p className="text-sm text-muted-foreground font-body mt-1 max-w-xl">
                        When on, the public site uses the winter snow-removal layout.
                      </p>
                    </div>
                    <Switch
                      id="snow-season-switch"
                      checked={snowContractSeason}
                      disabled={isSavingSeason}
                      onCheckedChange={handleSnowSeasonChange}
                      data-testid="snow-season-switch"
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        )}
      </main>

      <Dialog open={showLeadDetail} onOpenChange={setShowLeadDetail}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-heading text-xl">Lead Details</DialogTitle>
            <DialogDescription className="font-body">
              Status, priority, comments, and estimates
            </DialogDescription>
          </DialogHeader>
          {selectedLead && (
            <div className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <Label className="font-body text-xs text-muted-foreground">Name</Label>
                  <p className="font-body font-medium">{selectedLead.name}</p>
                </div>
                <div className="space-y-1">
                  <Label className="font-body text-xs text-muted-foreground">Service</Label>
                  <p className="font-body">
                    {serviceShortLabel(selectedLead.service_type)}
                  </p>
                </div>
                <div className="space-y-1">
                  <Label className="font-body text-xs text-muted-foreground">Email</Label>
                  <a
                    href={`mailto:${selectedLead.email}`}
                    className="font-body text-primary hover:underline flex items-center gap-1 text-sm"
                  >
                    <Mail className="w-3 h-3" />
                    {selectedLead.email}
                  </a>
                </div>
                <div className="space-y-1">
                  <Label className="font-body text-xs text-muted-foreground">Phone</Label>
                  <a
                    href={`tel:${selectedLead.phone}`}
                    className="font-body text-primary hover:underline flex items-center gap-1 text-sm"
                  >
                    <Phone className="w-3 h-3" />
                    {selectedLead.phone}
                  </a>
                </div>
              </div>

              {selectedLead.message && (
                <div className="space-y-1">
                  <Label className="font-body text-xs text-muted-foreground">
                    Form message
                  </Label>
                  <p className="font-body text-sm bg-muted/50 p-3 rounded-lg">
                    {selectedLead.message}
                  </p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="font-body text-xs text-muted-foreground">Status</Label>
                  <Select
                    value={selectedLead.status}
                    onValueChange={(v) => handleStatusChange(selectedLead.id, v)}
                  >
                    <SelectTrigger
                      className={`h-9 text-sm font-body ${getStatusColor(selectedLead.status)}`}
                    >
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {LEAD_STATUSES.map((s) => (
                        <SelectItem key={s} value={s} className="font-body text-sm capitalize">
                          {s}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="font-body text-xs text-muted-foreground">Priority</Label>
                  <Select
                    value={selectedLead.priority || "medium"}
                    onValueChange={(v) => handlePriorityChange(selectedLead.id, v)}
                  >
                    <SelectTrigger
                      className={`h-9 text-sm font-body ${getPriorityColor(
                        selectedLead.priority
                      )}`}
                    >
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {PRIORITIES.map((p) => (
                        <SelectItem key={p} value={p} className="font-body text-sm capitalize">
                          {p}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-3">
                <Label className="font-body text-xs text-muted-foreground flex items-center gap-2">
                  <MessageSquare className="w-3.5 h-3.5" />
                  Comments
                </Label>
                <div className="space-y-2">
                  <Textarea
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder='e.g. Talked to client — has a commercial property, wants seasonal snow quote'
                    className="font-body min-h-[80px]"
                  />
                  <Button
                    size="sm"
                    onClick={handleAddComment}
                    disabled={isSavingComment || !newComment.trim()}
                    className="font-body"
                  >
                    <Plus className="w-3 h-3 mr-2" />
                    {isSavingComment ? "Saving..." : "Add Comment"}
                  </Button>
                </div>
                {leadComments.length === 0 ? (
                  <p className="font-body text-sm text-muted-foreground">No comments yet.</p>
                ) : (
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {leadComments.map((comment) => (
                      <div key={comment.id} className="rounded-lg border p-3 space-y-1">
                        <div className="flex items-start justify-between gap-2">
                          <p className="font-body text-sm whitespace-pre-wrap">{comment.body}</p>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 w-7 shrink-0 p-0 text-muted-foreground hover:text-destructive"
                            onClick={() => handleDeleteComment(comment.id)}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        </div>
                        <p className="font-body text-xs text-muted-foreground">
                          {comment.author} ·{" "}
                          {new Date(comment.created_at).toLocaleString("en-CA")}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {getLeadInvoices(selectedLead.id).length > 0 && (
                <div className="space-y-2">
                  <Label className="font-body text-xs text-muted-foreground">
                    Estimates & Invoices
                  </Label>
                  <div className="space-y-1">
                    {getLeadInvoices(selectedLead.id).map((doc) => (
                      <button
                        key={doc.id}
                        type="button"
                        className="flex w-full items-center justify-between rounded-lg bg-muted/50 p-2 text-left hover:bg-muted"
                        onClick={() => openInvoiceDetail(doc)}
                      >
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="font-body text-xs capitalize">
                            {doc.type}
                          </Badge>
                          <span className="font-body text-sm font-medium">
                            {doc.invoice_number}
                          </span>
                          <span className="font-body text-sm text-muted-foreground">
                            {money(doc.total)}
                          </span>
                        </div>
                        <Badge
                          className={`font-body text-xs ${getInvoiceStatusColor(doc.status)}`}
                        >
                          {doc.status}
                        </Badge>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <Separator />
              <div className="flex flex-wrap gap-2 justify-between">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => openInvoiceFormForLead(selectedLead, "estimate")}
                  className="font-body"
                >
                  <ChevronRight className="w-4 h-4 mr-2" />
                  Create Estimate
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => {
                    handleDeleteLead(selectedLead.id);
                    setShowLeadDetail(false);
                  }}
                  className="font-body"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete Lead
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={showInvoiceDetail} onOpenChange={setShowInvoiceDetail}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-heading text-xl">
              {selectedInvoice?.type === "estimate" ? "Estimate" : "Invoice"}{" "}
              {selectedInvoice?.invoice_number}
            </DialogTitle>
            <DialogDescription className="font-body">
              View details, email the client, or mark payment received
            </DialogDescription>
          </DialogHeader>
          {selectedInvoice && (
            <div className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <Label className="font-body text-xs text-muted-foreground">Client</Label>
                  <p className="font-body font-medium">{selectedInvoice.client_name}</p>
                </div>
                <div className="space-y-1">
                  <Label className="font-body text-xs text-muted-foreground">Email</Label>
                  <p className="font-body text-sm">{selectedInvoice.client_email || "—"}</p>
                </div>
                <div className="space-y-1">
                  <Label className="font-body text-xs text-muted-foreground">Phone</Label>
                  <p className="font-body text-sm">{selectedInvoice.client_phone || "—"}</p>
                </div>
                <div className="space-y-1">
                  <Label className="font-body text-xs text-muted-foreground">Due Date</Label>
                  <p className="font-body text-sm">
                    {selectedInvoice.due_date
                      ? new Date(selectedInvoice.due_date).toLocaleDateString()
                      : "—"}
                  </p>
                </div>
              </div>

              {selectedInvoice.items?.length > 0 && (
                <div className="space-y-2">
                  <Label className="font-body text-xs text-muted-foreground">Line Items</Label>
                  <div className="rounded-lg border overflow-hidden">
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-muted/30">
                          <TableHead className="font-body text-xs">Description</TableHead>
                          <TableHead className="font-body text-xs text-right">Qty</TableHead>
                          <TableHead className="font-body text-xs text-right">Unit Price</TableHead>
                          <TableHead className="font-body text-xs text-right">Amount</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {selectedInvoice.items.map((item) => (
                          <TableRow key={item.id}>
                            <TableCell className="font-body text-sm">
                              {item.description}
                            </TableCell>
                            <TableCell className="font-body text-sm text-right">
                              {Number(item.quantity)}
                            </TableCell>
                            <TableCell className="font-body text-sm text-right">
                              {money(item.unit_price)}
                            </TableCell>
                            <TableCell className="font-body text-sm text-right">
                              {money(item.amount)}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                  <div className="bg-muted/50 rounded-lg p-3 space-y-1.5 text-sm font-body">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Subtotal</span>
                      <span>{money(selectedInvoice.subtotal)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">
                        Tax ({Number(selectedInvoice.tax_rate)}%)
                      </span>
                      <span>{money(selectedInvoice.tax_amount)}</span>
                    </div>
                    <div className="flex justify-between font-semibold text-base border-t pt-1.5">
                      <span>Total</span>
                      <span>{money(selectedInvoice.total)}</span>
                    </div>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="font-body text-xs text-muted-foreground">Status</Label>
                  <Select
                    value={selectedInvoice.status}
                    onValueChange={(v) => {
                      if (v === "paid") {
                        markInvoicePaid(selectedInvoice.id);
                      } else {
                        handleInvoiceStatusChange(selectedInvoice.id, v);
                      }
                    }}
                  >
                    <SelectTrigger
                      className={`h-9 text-sm font-body w-full ${getInvoiceStatusColor(
                        selectedInvoice.status
                      )}`}
                    >
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {INVOICE_STATUSES.map((s) => (
                        <SelectItem key={s} value={s} className="font-body text-sm capitalize">
                          {s}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                {selectedInvoice.payment_method && (
                  <div className="space-y-1">
                    <Label className="font-body text-xs text-muted-foreground">
                      Payment method
                    </Label>
                    <p className="font-body text-sm capitalize">
                      {selectedInvoice.payment_method === "etransfer"
                        ? "E-transfer"
                        : selectedInvoice.payment_method}
                    </p>
                  </div>
                )}
              </div>

              <div className="space-y-2 p-4 border rounded-lg">
                <Label className="font-body font-semibold text-sm flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  Send by Email
                </Label>
                <div className="flex gap-2">
                  <Input
                    value={sendEmailTo}
                    onChange={(e) => setSendEmailTo(e.target.value)}
                    placeholder="client@email.com"
                    className="font-body text-sm h-8"
                  />
                  <Button
                    size="sm"
                    onClick={() =>
                      handleSendEmail(
                        selectedInvoice.id,
                        sendEmailTo || selectedInvoice.client_email
                      )
                    }
                    disabled={isSendingEmail}
                    className="font-body whitespace-nowrap"
                  >
                    <Send className="w-3 h-3 mr-2" />
                    {isSendingEmail ? "Sending..." : "Send"}
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground font-body">
                  Uses Resend (`RESEND_API_KEY`). Invoice emails note cash / e-transfer payment.
                </p>
              </div>

              <Separator />
              <div className="flex flex-wrap gap-2 justify-between">
                <div className="flex gap-2 flex-wrap">
                  {selectedInvoice.type === "estimate" && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleConvertEstimateToInvoice(selectedInvoice.id)}
                      className="font-body"
                    >
                      <ArrowRightLeft className="w-4 h-4 mr-2" />
                      Convert to Invoice
                    </Button>
                  )}
                  {selectedInvoice.status !== "paid" && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => markInvoicePaid(selectedInvoice.id)}
                      className="font-body"
                    >
                      <Banknote className="w-4 h-4 mr-2" />
                      Mark Paid (cash / e-transfer)
                    </Button>
                  )}
                </div>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => handleDeleteInvoice(selectedInvoice.id)}
                  className="font-body"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={showInvoiceForm} onOpenChange={setShowInvoiceForm}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-heading text-xl capitalize">
              Create {invoiceType}
            </DialogTitle>
            <DialogDescription className="font-body">
              Fill in client details and line items.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-6">
            <div className="flex gap-2">
              <Button
                variant={invoiceType === "estimate" ? "default" : "outline"}
                size="sm"
                onClick={() => setInvoiceType("estimate")}
                className="font-body"
              >
                Estimate
              </Button>
              <Button
                variant={invoiceType === "invoice" ? "default" : "outline"}
                size="sm"
                onClick={() => setInvoiceType("invoice")}
                className="font-body"
              >
                Invoice
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="font-body text-sm">Client Name *</Label>
                <Input
                  value={invoiceForm.client_name}
                  onChange={(e) =>
                    setInvoiceForm({ ...invoiceForm, client_name: e.target.value })
                  }
                  className="font-body"
                />
              </div>
              <div className="space-y-2">
                <Label className="font-body text-sm">Email</Label>
                <Input
                  type="email"
                  value={invoiceForm.client_email}
                  onChange={(e) =>
                    setInvoiceForm({ ...invoiceForm, client_email: e.target.value })
                  }
                  className="font-body"
                />
              </div>
              <div className="space-y-2">
                <Label className="font-body text-sm">Phone</Label>
                <Input
                  value={invoiceForm.client_phone}
                  onChange={(e) =>
                    setInvoiceForm({ ...invoiceForm, client_phone: e.target.value })
                  }
                  className="font-body"
                />
              </div>
              <div className="space-y-2">
                <Label className="font-body text-sm">Due Date</Label>
                <Input
                  type="date"
                  value={invoiceForm.due_date}
                  onChange={(e) =>
                    setInvoiceForm({ ...invoiceForm, due_date: e.target.value })
                  }
                  className="font-body"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="font-body text-sm">Address</Label>
              <Input
                value={invoiceForm.client_address}
                onChange={(e) =>
                  setInvoiceForm({ ...invoiceForm, client_address: e.target.value })
                }
                className="font-body"
              />
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-body font-semibold text-xs text-muted-foreground uppercase tracking-wide">
                  Line Items
                </h3>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={addInvoiceItem}
                  className="font-body"
                >
                  <Plus className="w-3 h-3 mr-1" />
                  Add Item
                </Button>
              </div>
              <div className="space-y-2">
                {invoiceForm.items.map((item, index) => (
                  <div key={index} className="grid grid-cols-12 gap-2 items-end">
                    <div className="col-span-6 space-y-1">
                      {index === 0 && (
                        <Label className="font-body text-xs text-muted-foreground">
                          Description
                        </Label>
                      )}
                      <Input
                        value={item.description}
                        onChange={(e) =>
                          updateInvoiceItem(index, "description", e.target.value)
                        }
                        className="font-body text-sm"
                      />
                    </div>
                    <div className="col-span-2 space-y-1">
                      {index === 0 && (
                        <Label className="font-body text-xs text-muted-foreground">Qty</Label>
                      )}
                      <Input
                        type="number"
                        min="0"
                        step="0.5"
                        value={item.quantity}
                        onChange={(e) => updateInvoiceItem(index, "quantity", e.target.value)}
                        className="font-body text-sm"
                      />
                    </div>
                    <div className="col-span-3 space-y-1">
                      {index === 0 && (
                        <Label className="font-body text-xs text-muted-foreground">
                          Unit Price
                        </Label>
                      )}
                      <Input
                        type="number"
                        min="0"
                        step="0.01"
                        value={item.unit_price}
                        onChange={(e) =>
                          updateInvoiceItem(index, "unit_price", e.target.value)
                        }
                        className="font-body text-sm"
                      />
                    </div>
                    <div className="col-span-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeInvoiceItem(index)}
                        disabled={invoiceForm.items.length <= 1}
                        className="h-9 w-9 p-0 text-muted-foreground hover:text-destructive"
                      >
                        <XCircle className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-3 border-t pt-4">
              <div className="flex items-center gap-3">
                <Label className="font-body text-sm whitespace-nowrap">Tax Rate (%)</Label>
                <Input
                  type="number"
                  min="0"
                  max="100"
                  step="0.5"
                  value={invoiceForm.tax_rate}
                  onChange={(e) =>
                    setInvoiceForm({ ...invoiceForm, tax_rate: e.target.value })
                  }
                  className="font-body text-sm w-24"
                />
              </div>
              <div className="bg-muted/50 rounded-lg p-4 space-y-1.5 text-sm font-body">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span>{money(invoiceSubtotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">
                    Tax ({Number(invoiceForm.tax_rate) || 0}%)
                  </span>
                  <span>{money(invoiceTax)}</span>
                </div>
                <div className="flex justify-between font-semibold text-base border-t pt-2">
                  <span>Total</span>
                  <span>{money(invoiceTotal)}</span>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label className="font-body text-sm">Notes</Label>
              <Textarea
                value={invoiceForm.notes}
                onChange={(e) => setInvoiceForm({ ...invoiceForm, notes: e.target.value })}
                placeholder="Additional notes or terms..."
                className="font-body min-h-[70px]"
              />
            </div>
          </div>
          <DialogFooter className="gap-2 mt-2">
            <Button
              variant="outline"
              onClick={() => setShowInvoiceForm(false)}
              className="font-body"
            >
              Cancel
            </Button>
            <Button
              onClick={handleCreateInvoice}
              disabled={isSavingInvoice}
              className="font-body"
            >
              <FileText className="w-4 h-4 mr-2" />
              {isSavingInvoice
                ? "Creating..."
                : `Create ${invoiceType === "invoice" ? "Invoice" : "Estimate"}`}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminDashboard;
