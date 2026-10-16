"use client";

import React from "react";
import {
  Users,
  User,
  UserPlus,
  Clock,
  ArrowUp,
  TrendingUp,
  Award,
  Stethoscope,
  Eye,
  Ear,
  Smile,
  Heart,
  Shield,
  Calendar,
  Target,
  Layers,
  GraduationCap,
  Sparkles,
  Activity,
  Info,
  Download,
  RefreshCw,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  PieChartIcon,
  BarChart2,
} from "lucide-react";
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

/* ============================================================
   DASHBOARD DATA  (static snapshot provided by the school)
   ============================================================ */

const DATA = {
  students: {
    total: 1765,
    age_wise: {
      "0-5": 234,
      "6-13": 1030,
      "14-17": 497,
      "18+": 3,
      unknown: 1,
    },
    gender_wise: {
      male: 964,
      female: 800,
      { class: "1", male: 16, female: 13, sections: [{ section: "A", male: 16, female: 13 }, { section: "B", male: 16, female: 13 }, { section: "C", male: 15, female: 11 }, { section: "D", male: 12, female: 13 }] },
      { class: "10", male: 16, female: 17, sections: [{ section: "A", male: 16, female: 17 }, { section: "B", male: 17, female: 15 }, { section: "C", male: 20, female: 13 }, { section: "D", male: 17, female: 15 }] },
      { class: "11", male: 21, female: 25, sections: [{ section: "A", male: 21, female: 25 }, { section: "B", male: 18, female: 24 }, { section: "C1", male: 31, female: 8 }, { section: "C2", male: 28, female: 10 }] },
      { class: "12", male: 25, female: 15, sections: [{ section: "A", male: 25, female: 15 }, { section: "B", male: 15, female: 19 }, { section: "C1", male: 22, female: 13 }, { section: "C2", male: 23, female: 11 }] },
      { class: "2", male: 16, female: 15, sections: [{ section: "A", male: 16, female: 15 }, { section: "B", male: 17, female: 14 }, { section: "C", male: 14, female: 12 }, { section: "D", male: 19, female: 12 }] },

      { class: "3", male: 17, female: 14, sections: [{ section: "A", male: 17, female: 14 }, { section: "B", male: 19, female: 13 }, { section: "C", male: 19, female: 12 }, { section: "D", male: 17, female: 15 }] },
      { class: "4", male: 17, female: 10, sections: [{ section: "A", male: 17, female: 10 }, { section: "B", male: 13, female: 14 }, { section: "C", male: 9, female: 16 }, { section: "D", male: 14, female: 11 }] },
      { class: "5", male: 19, female: 14, sections: [{ section: "A", male: 19, female: 14 }, { section: "B", male: 18, female: 15 }, { section: "C", male: 18, female: 15 }, { section: "D", male: 21, female: 14 }] },
      { class: "6", male: 15, female: 18, sections: [{ section: "A", male: 15, female: 18 }, { section: "B", male: 20, female: 11 }, { section: "C", male: 18, female: 12 }, { section: "D", male: 19, female: 10 }] },
      { class: "7", male: 14, female: 18, sections: [{ section: "A", male: 14, female: 18 }, { section: "B", male: 16, female: 17 }, { section: "C", male: 17, female: 15 }, { section: "D", male: 17, female: 14 }] },

      other: 0,
      unknown: 1,
    },
    class_wise: [
