import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import AdminLayout from "@/components/admin/AdminLayout";
import { SEO } from "@/components/SEO";

export default function ChannelsPage() {
  return (
    <AdminLayout>
      <SEO title="Channels - AI Assistant Admin" />
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Channels</h1>
          <p className="text-slate-600 mt-1">
            Configure integrations with WhatsApp, Facebook, and Instagram.
          </p>
        </div>
        <div className="bg-white p-8 rounded-lg shadow text-center text-slate-500">
          <p>Channel configuration interface is coming soon.</p>
        </div>
      </div>
    </AdminLayout>
  );
}