"use client";

import { CheckCircle2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/language-context";
import { motion } from "framer-motion";

interface WhatsAppSuccessModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  teacherName?: string;
}

export function WhatsAppSuccessModal({
  open,
  onOpenChange,
  teacherName,
}: WhatsAppSuccessModalProps) {
  const { t } = useLanguage();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.2 }}
        >
          <DialogHeader className="text-center">
            <div className="flex justify-center mb-4">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.1, type: "spring", stiffness: 200 }}
                className="relative"
              >
                <div className="absolute inset-0 bg-green-100 rounded-full animate-ping opacity-75" />
                <div className="relative bg-green-50 rounded-full p-3">
                  <CheckCircle2 className="h-12 w-12 text-green-600" />
                </div>
              </motion.div>
            </div>
            <DialogTitle className="text-2xl font-bold text-gray-900">
              {t("teachers.credentialsSentSuccessfully") || "تم الإرسال بنجاح"}
            </DialogTitle>
            <DialogDescription className="text-base mt-2 text-gray-600">
              {teacherName
                ? `${t("teachers.credentialsSentTo") || "تم إرسال بيانات الدخول إلى"} ${teacherName} ${t("teachers.viaWhatsApp") || "عبر واتساب"}`
                : t("teachers.credentialsSentViaWhatsApp") || "تم إرسال بيانات الدخول عبر واتساب بنجاح"}
            </DialogDescription>
          </DialogHeader>
          <div className="mt-6 flex justify-center">
            <Button
              onClick={() => onOpenChange(false)}
              className="bg-green-600 hover:bg-green-700 text-white px-8"
            >
              {t("teachers.close") || t("common.cancel") || "إغلاق"}
            </Button>
          </div>
        </motion.div>
      </DialogContent>
    </Dialog>
  );
}
