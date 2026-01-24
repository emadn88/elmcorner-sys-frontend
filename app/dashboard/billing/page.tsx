"use client";

import { useLanguage } from "@/contexts/language-context";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CreditCard } from "lucide-react";

export default function BillingPage() {
  const { t, direction } = useLanguage();

  return (
    <div className={`flex flex-col gap-6 ${direction === "rtl" ? "text-right" : "text-left"}`}>
      <div>
        <h1 className="text-3xl font-bold text-gray-900">
          {t("sidebar.billing")}
        </h1>
        <p className="text-gray-600 mt-2">
          {t("common.comingSoon") || "This page is coming soon"}
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            {t("sidebar.billing")}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12">
            <CreditCard className="h-16 w-16 mx-auto text-gray-400 mb-4" />
            <p className="text-gray-500 text-lg">
              {t("common.comingSoon") || "This feature will be available soon"}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
