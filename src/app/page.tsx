"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Activity,
  AlertTriangle,
  Cpu,
  Layers,
  Settings,
  Shield,
  Sliders,
  Terminal,
  CheckCircle2,
  XCircle,
  RefreshCw,
  Play,
  Check,
  Zap,
  Database,
  Network,
  ChevronRight,
  TrendingUp,
  User,
  Clock,
  ArrowRight,
  Lock,
  RotateCcw,
  Sparkles,
  Info,
  Server,
  Plus,
  Menu,
  Home,
  History
} from "lucide-react";
import confetti from "canvas-confetti";

// Types for State Management
type FailureType = "none" | "adversarial" | "drift" | "bias" | "backdoor" | "random";
type RiskLevel = "low" | "medium" | "high" | "critical";
type RepairOp = "weight" | "mask" | "freeze" | "lowrank" | "reset" | "gradient";
type Mode = "loop" | "manual-surgical";
type SolveStatus = "idle" | "solving" | "safe" | "authorized" | "warning" | "counterexample";

interface LogEntry {
  timestamp: string;
  type: "info" | "warning" | "error" | "success" | "system";
  message: string;
}

interface TimelineEntry {
  id: string;
  timestamp: string;
  version: string;
  failureType: string;
  strategy: string;
  validationResult: string;
  operator: string;
}

interface NeuralLayer {
  id: string;
  name: string;
  type: string;
  neurons: number;
  memory: string;
  trainable: number;
  status: "nominal" | "degraded" | "isolated" | "repaired";
}

export default function UniRepairNetDashboard() {
  // Sidebar & Section States
  const [activeTab, setActiveTab] = useState<string>("dashboard");
  const [isSidebarExpanded, setIsSidebarExpanded] = useState<boolean>(true);

  // Global App Controls
  const [appMode, setAppMode] = useState<Mode>("loop");
  const [modelVersion, setModelVersion] = useState("v4.2.1-production");
  const [systemHealth, setSystemHealth] = useState(98);
  const [completedRepairs, setCompletedRepairs] = useState(4);
  const [pendingRepairs, setPendingRepairs] = useState(0);

  // Failure Simulation States
  const [activeFailure, setActiveFailure] = useState<FailureType>("none");
  const [riskLevel, setRiskLevel] = useState<RiskLevel>("low");
  const [failureSig, setFailureSig] = useState({ adv: 0.02, drift: 0.03, bias: 0.01, backdoor: 0.01 });
  const [telemetry, setTelemetry] = useState({
    confidence: 94.2,
    gpuUtil: 62.5,
    memory: 14.2,
    latency: 12.4,
    driftScore: 0.02,
    biasScore: 0.01,
  });

  // Repair Strategy Strategy
  const [optimizationMode, setOptimizationMode] = useState<"auto" | "manual">("auto");
  const [coefAlpha, setCoefAlpha] = useState(0.5); // Task Accuracy
  const [coefBeta, setCoefBeta] = useState(0.4);  // Repair Cost
  const [coefGamma, setCoefGamma] = useState(0.3); // Complexity
  const [coefDelta, setCoefDelta] = useState(0.2); // Safety Bounds
  const [recommendedStrategy, setRecommendedStrategy] = useState("Nominal Operation");
  const [strategyRationale, setStrategyRationale] = useState(
    "All model weights and output parameters are within formal safety limits. Running baseline continuous validation."
  );
  const [optimizationScore, setOptimizationScore] = useState(96);

  // Neural Network Layers Sandbox
  const [layers, setLayers] = useState<NeuralLayer[]>([
    { id: "input", name: "Input Embedding", type: "Input", neurons: 51200, memory: "200 MB", trainable: 0, status: "nominal" },
    { id: "projection", name: "Projection Layer", type: "Projection", neurons: 1024, memory: "4.2 MB", trainable: 1048576, status: "nominal" },
    { id: "attn1", name: "Attention Block 1", type: "Attention", neurons: 4096, memory: "64.5 MB", trainable: 16777216, status: "nominal" },
    { id: "attn2", name: "Attention Block 2", type: "Attention", neurons: 4096, memory: "64.5 MB", trainable: 16777216, status: "nominal" },
    { id: "norm", name: "Normalization Node", type: "LayerNorm", neurons: 1024, memory: "1.2 MB", trainable: 2048, status: "nominal" },
    { id: "output", name: "Output Classifier", type: "Dense/Linear", neurons: 1000, memory: "8.1 MB", trainable: 1024000, status: "nominal" },
  ]);
  const [selectedLayers, setSelectedLayers] = useState<string[]>([]);
  const [repairOp, setRepairOp] = useState<RepairOp>("weight");

  // Verification Pipeline States
  const [repairStatus, setRepairStatus] = useState<"idle" | "running" | "completed">("idle");
  const [pipelineProgress, setPipelineProgress] = useState(0);
  const [pipeALogs, setPipeALogs] = useState<string[]>([]);
  const [pipeBLogs, setPipeBLogs] = useState<string[]>([]);
  const [verificationBadge, setVerificationBadge] = useState<SolveStatus>("idle");
  const [verificationMetrics, setVerificationMetrics] = useState({
    accuracy: 94.2,
    precision: 93.8,
    recall: 94.0,
    f1: 93.9,
    latency: 12.4,
  });

  // Deployment States
  const [deployStatus, setDeployStatus] = useState<"idle" | "deploying" | "deployed">("idle");
  const [deployLogs, setDeployLogs] = useState<string[]>([]);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Log Feed & History Timeline
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [timeline, setTimeline] = useState<TimelineEntry[]>([
    {
      id: "patch-0",
      timestamp: "2026-07-17 10:14:02",
      version: "v4.2.0-hotpatch",
      failureType: "Concept Drift",
      strategy: "Low-Rank Adaptation (LoRA)",
      validationResult: "SAFE (Accuracy: 93.8%)",
      operator: "SYSTEM/AUTO",
    },
    {
      id: "patch-1",
      timestamp: "2026-07-16 16:32:45",
      version: "v4.1.9-hotpatch",
      failureType: "Demographic Bias",
      strategy: "Bias Calibration",
      validationResult: "SAFE (Fairness Check Pass)",
      operator: "M. Chen (Senior MLOps)",
    },
  ]);

  const terminalEndRef = useRef<HTMLDivElement>(null);
  const pipeAEndRef = useRef<HTMLDivElement>(null);
  const pipeBEndRef = useRef<HTMLDivElement>(null);

  // Helper to add system logs
  const addLog = (message: string, type: LogEntry["type"] = "info") => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs((prev) => [...prev.slice(-49), { timestamp, type, message }]);
  };

  // Scroll terminals to bottom
  useEffect(() => {
    terminalEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [logs]);

  useEffect(() => {
    pipeAEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [pipeALogs]);

  useEffect(() => {
    pipeBEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [pipeBLogs]);

  // Initial logs
  useEffect(() => {
    addLog("System initialized. Model monitoring active.", "system");
    addLog("Evaluating neural layer constraint integrity...", "info");
    addLog("Cluster nodes status: 8x H100 GPU cluster nominal. Latency = 12.4ms.", "success");
    
    // Continuous baseline telemetry changes
    const interval = setInterval(() => {
      if (activeFailure === "none" && repairStatus === "idle" && deployStatus === "idle") {
        setTelemetry((prev) => ({
          confidence: +(94.0 + Math.random() * 0.5).toFixed(2),
          gpuUtil: +(60 + Math.random() * 6).toFixed(1),
          memory: 14.2,
          latency: +(12.1 + Math.random() * 0.8).toFixed(1),
          driftScore: +(0.01 + Math.random() * 0.02).toFixed(3),
          biasScore: +(0.005 + Math.random() * 0.005).toFixed(3),
        }));
        
        if (Math.random() > 0.7) {
          const inferConf = (94.0 + Math.random() * 0.5).toFixed(2);
          addLog(`Inference baseline stable. Latency: ${12.1 + Math.random() * 0.8}ms | Conf: ${inferConf}%`, "info");
        }
      }
    }, 4000);

    return () => clearInterval(interval);
  }, [activeFailure, repairStatus, deployStatus]);

  // Handle Event Injections
  const handleInjectFailure = (type: FailureType) => {
    if (repairStatus === "running" || deployStatus === "deploying") return;

    setActiveFailure(type);
    setToastMessage(`Critical: ${type.toUpperCase()} failure mode injected.`);
    setTimeout(() => setToastMessage(null), 3000);

    // Reset verification states
    setVerificationBadge("idle");
    setPipelineProgress(0);
    setRepairStatus("idle");

    // Dynamic metrics alteration
    let sig = { adv: 0.01, drift: 0.02, bias: 0.01, backdoor: 0.01 };
    let tel = { confidence: 94.2, gpuUtil: 65, memory: 14.2, latency: 12.4, driftScore: 0.02, biasScore: 0.01 };
    let risk: RiskLevel = "low";

    addLog(`[INJECTION] Admin triggered: ${type.toUpperCase()}`, "warning");

    switch (type) {
      case "adversarial":
        sig = { adv: 0.97, drift: 0.08, bias: 0.02, backdoor: 0.03 };
        tel = { confidence: 48.6, gpuUtil: 88.4, memory: 15.6, latency: 38.2, driftScore: 0.05, biasScore: 0.02 };
        risk = "critical";
        addLog("CRITICAL: Adversarial perturbation detected in input stream! Confidence dropped sharply.", "error");
        addLog("ANOMALY: High cosine distance in L2 embedding projection layers.", "warning");
        break;
      case "drift":
        sig = { adv: 0.04, drift: 0.94, bias: 0.06, backdoor: 0.02 };
        tel = { confidence: 68.1, gpuUtil: 72.1, memory: 14.8, latency: 15.6, driftScore: 0.84, biasScore: 0.04 };
        risk = "medium";
        addLog("WARNING: Dataset distribution drift detected. Feature space mean value shifted.", "warning");
        addLog("METRIC: Population Stability Index (PSI) = 0.42 (Threshold 0.20 exceeded).", "info");
        break;
      case "bias":
        sig = { adv: 0.02, drift: 0.05, bias: 0.96, backdoor: 0.01 };
        tel = { confidence: 82.4, gpuUtil: 64.2, memory: 14.2, latency: 12.8, driftScore: 0.03, biasScore: 0.78 };
        risk = "high";
        addLog("WARNING: Disparate impact ratio dropped below 0.80 across protected demographic variables.", "warning");
        addLog("METRIC: Demographic Parity Difference = 0.18 (Threshold 0.10 exceeded).", "warning");
        break;
      case "backdoor":
        sig = { adv: 0.12, drift: 0.02, bias: 0.02, backdoor: 0.99 };
        tel = { confidence: 91.5, gpuUtil: 95.8, memory: 18.2, latency: 44.5, driftScore: 0.02, biasScore: 0.01 };
        risk = "critical";
        addLog("ALERT: Trojan trigger pattern recognized in neural activations! Security lock activated.", "error");
        addLog("CRITICAL: Out-of-bounds neuron activation values in Attention Block 2.", "error");
        break;
      case "random":
        sig = { adv: 0.35, drift: 0.42, bias: 0.28, backdoor: 0.22 };
        tel = { confidence: 58.2, gpuUtil: 75.6, memory: 15.2, latency: 22.4, driftScore: 0.48, biasScore: 0.38 };
        risk = "medium";
        addLog("WARNING: General structural deterioration detected. Multiple model outputs corrupted.", "warning");
        break;
      case "none":
      default:
        sig = { adv: 0.02, drift: 0.03, bias: 0.01, backdoor: 0.01 };
        tel = { confidence: 94.2, gpuUtil: 62.5, memory: 14.2, latency: 12.4, driftScore: 0.02, biasScore: 0.01 };
        risk = "low";
        addLog("System normalized. Telemetry within standard boundary limits.", "success");
        break;
    }

    setFailureSig(sig);
    setTelemetry(tel);
    setRiskLevel(risk);

    // Apply auto-pilot logic to adjust sliders and recommendations
    if (optimizationMode === "auto") {
      applyAutoPilotConfig(type);
    }
  };

  const applyAutoPilotConfig = (type: FailureType) => {
    let alpha = 0.5, beta = 0.4, gamma = 0.3, delta = 0.2;
    let strategy = "Continuous Validation";
    let rationale = "No active failures detected. Maintaining default parameters.";
    let activeLayers: string[] = [];
    let operation: RepairOp = "weight";

    switch (type) {
      case "adversarial":
        alpha = 0.25;
        beta = 0.45;
        gamma = 0.3;
        delta = 0.95;
        strategy = "Adversarial Patch Repair & Robustness Fine-Tuning";
        rationale = "High adversarial signal requires maximum safety constraints (δ) and gradient filtering to stabilize local lipschitz bounds.";
        activeLayers = ["attn1", "attn2"];
        operation = "gradient";
        break;
      case "drift":
        alpha = 0.85;
        beta = 0.3;
        gamma = 0.45;
        delta = 0.25;
        strategy = "Low-Rank Adaptation (LoRA) Weight Fine-Tuning";
        rationale = "Distribution drift demands prioritizing high performance (α) via parameter-efficient adaptors in hidden projection blocks.";
        activeLayers = ["projection", "attn2"];
        operation = "lowrank";
        break;
      case "bias":
        alpha = 0.65;
        beta = 0.2;
        gamma = 0.35;
        delta = 0.85;
        strategy = "Bias Calibration via Layer-Wise Fair Alignment";
        rationale = "Demographic parity discrepancies are resolved by applying safety penalizations (δ) on output projection normalization parameters.";
        activeLayers = ["norm", "output"];
        operation = "weight";
        break;
      case "backdoor":
        alpha = 0.35;
        beta = 0.65;
        gamma = 0.75;
        delta = 0.9;
        strategy = "Neuron Masking & Layer Isolation";
        rationale = "Backdoors are isolated by identifying and pruning targeted malicious activations within Attention Blocks.";
        activeLayers = ["attn2"];
        operation = "mask";
        break;
      case "random":
        alpha = 0.5;
        beta = 0.5;
        gamma = 0.4;
        delta = 0.5;
        strategy = "Global Weight Reset & Parameter Pruning";
        rationale = "Corrupted states are fixed by reverting weights to previous validated checkpoint parameters and retraining.";
        activeLayers = ["projection", "norm"];
        operation = "reset";
        break;
    }

    setCoefAlpha(alpha);
    setCoefBeta(beta);
    setCoefGamma(gamma);
    setCoefDelta(delta);
    setRecommendedStrategy(strategy);
    setStrategyRationale(rationale);
    setSelectedLayers(activeLayers);
    setRepairOp(operation);

    // Compute Optimization Score
    const score = Math.round(98 - (alpha * 12 + beta * 8 + gamma * 10 - delta * 4) + Math.random() * 3);
    setOptimizationScore(score);

    // Update layer status visuals to show degradation
    setLayers((prev) =>
      prev.map((l) => {
        if (activeLayers.includes(l.id)) {
          return { ...l, status: "degraded" };
        }
        return { ...l, status: "nominal" };
      })
    );
  };

  // Recalculate Recommendation when manual parameters modify
  useEffect(() => {
    if (optimizationMode === "manual") {
      const score = Math.round(
        100 - (coefAlpha * 10 + coefBeta * 15 + coefGamma * 8 - coefDelta * 12) - selectedLayers.length * 2
      );
      setOptimizationScore(Math.min(100, Math.max(30, score)));

      // Determine recommended strategy based on dominant slider
      const maxVal = Math.max(coefAlpha, coefBeta, coefGamma, coefDelta);
      if (maxVal === coefDelta) {
        setRecommendedStrategy("Adversarial Robustness Layer Hardening");
        setStrategyRationale("Safety constraints dominate configuration. Applying defensive distillation and formal bounds validation.");
      } else if (maxVal === coefAlpha) {
        setRecommendedStrategy("Full Parameters Re-Tuning");
        setStrategyRationale("Performance coefficients prioritized. Executing dense downstream adaptation across multi-layer nodes.");
      } else if (maxVal === coefBeta) {
        setRecommendedStrategy("Low-Rank Parameter Projection (LoRA)");
        setStrategyRationale("Repair overhead minimization requested. Tuning low-rank adapters to optimize compute-to-accuracy ratio.");
      } else {
        setRecommendedStrategy("Neuron Masking & Activation Calibration");
        setStrategyRationale("Structural complexity limits dominant. Pruning parameters with high activation entropy indices.");
      }
    }
  }, [coefAlpha, coefBeta, coefGamma, coefDelta, optimizationMode, selectedLayers]);

  // Execute Repair Simulation
  const handleExecuteRepair = () => {
    if (selectedLayers.length === 0) {
      setToastMessage("Warning: Please select at least one layer in Section 4.");
      setTimeout(() => setToastMessage(null), 3000);
      return;
    }

    setRepairStatus("running");
    setPipelineProgress(0);
    setVerificationBadge("solving");

    setPipeALogs(["[PIPE-A] Booting empirical testing suite...", "[PIPE-A] Allocating regression GPU partitions..."]);
    setPipeBLogs(["[PIPE-B] Compiling neural parameters to Marabou format...", "[PIPE-B] Generating SMT-Lib assertions..."]);

    addLog(`[REPAIR] Starting surgical surgery: ${recommendedStrategy} on layers: ${selectedLayers.join(", ")}`, "info");

    let progress = 0;
    const interval = setInterval(() => {
      progress += 10;
      setPipelineProgress(progress);

      // Pipe A (Empirical) Logs
      if (progress === 20) {
        setPipeALogs((prev) => [...prev, "[PIPE-A] Dataset loading: 50,000 baseline verification images active."]);
      } else if (progress === 40) {
        setPipeALogs((prev) => [...prev, "[PIPE-A] Executing standard regression sweep (Accuracy checking)..."]);
        setVerificationMetrics((prev) => ({ ...prev, accuracy: +(72 + Math.random() * 5).toFixed(1) }));
      } else if (progress === 60) {
        setPipeALogs((prev) => [...prev, "[PIPE-A] Running adversary perturbed boundary assessments..."]);
        setVerificationMetrics((prev) => ({ ...prev, precision: +(75 + Math.random() * 4).toFixed(1) }));
      } else if (progress === 80) {
        setPipeALogs((prev) => [...prev, "[PIPE-A] Auditing demographic parity & fairness parameters..."]);
        setVerificationMetrics((prev) => ({ ...prev, recall: +(78 + Math.random() * 3).toFixed(1), f1: +(77 + Math.random() * 3).toFixed(1) }));
      } else if (progress === 100) {
        setPipeALogs((prev) => [...prev, "[PIPE-A] Validation complete. Aggregating output metrics.", "[PIPE-A] SUCCESS: Threshold tolerances satisfied."]);
        // Set finalized high quality metrics
        setVerificationMetrics({
          accuracy: +(91.5 + Math.random() * 1.5).toFixed(1),
          precision: +(90.8 + Math.random() * 1.2).toFixed(1),
          recall: +(91.2 + Math.random() * 1.4).toFixed(1),
          f1: +(91.0 + Math.random() * 1.3).toFixed(1),
          latency: +(12.8 + Math.random() * 0.8).toFixed(1),
        });
      }

      // Pipe B (Formal) Logs
      if (progress === 20) {
        setPipeBLogs((prev) => [...prev, "[PIPE-B] SMT constraint model resolved: 12,482 Relu clauses."]);
      } else if (progress === 50) {
        setPipeBLogs((prev) => [...prev, "[PIPE-B] Marabou simplex engine processing bounding bounds..."]);
      } else if (progress === 80) {
        setPipeBLogs((prev) => [...prev, "[PIPE-B] Verifying local lipschitz property ε=0.01..."]);
      } else if (progress === 100) {
        // Set formal status badge based on failure type / slider safety values
        let finalStatus: SolveStatus = "safe";
        if (activeFailure === "backdoor" && coefDelta < 0.5) {
          finalStatus = "warning";
          setPipeBLogs((prev) => [...prev, "[PIPE-B] WARNING: Minor activation anomalies found in residual logs.", "[PIPE-B] STATUS: AUTHORIZED WITH CONDITIONS"]);
        } else if (activeFailure === "adversarial" && coefDelta < 0.4) {
          finalStatus = "counterexample";
          setPipeBLogs((prev) => [...prev, "[PIPE-B] ERROR: Counterexample input pattern discovered violating safety envelope.", "[PIPE-B] STATUS: REJECTED"]);
        } else {
          finalStatus = "safe";
          setPipeBLogs((prev) => [...prev, "[PIPE-B] Safety proofs verified. No counterexamples found.", "[PIPE-B] STATUS: SAFE / APPROVED"]);
        }
        setVerificationBadge(finalStatus);
      }

      if (progress >= 100) {
        clearInterval(interval);
        setRepairStatus("completed");
        addLog(`[REPAIR] Double pipeline completed. Verification status: ${verificationBadge.toUpperCase()}`, "success");
      }
    }, 400);
  };

  // Deploy Hot Patch
  const handleDeployPatch = () => {
    if (repairStatus !== "completed") return;

    setDeployStatus("deploying");
    setDeployLogs([
      "[DEPLOY] Initiating zero-downtime hot patch rolling deployment...",
      "[DEPLOY] Target nodes: cluster-node-[1..8].",
    ]);

    addLog("[DEPLOYMENT] Hot patch installation initiated. Syncing weights...", "info");

    let p = 0;
    const interval = setInterval(() => {
      p += 25;
      if (p === 25) {
        setDeployLogs((prev) => [...prev, "[DEPLOY] Syncing compiled weights into active tensor cells..."]);
      } else if (p === 50) {
        setDeployLogs((prev) => [...prev, "[DEPLOY] Redirecting inference traffic (rolling gateway redirection)..."]);
      } else if (p === 75) {
        setDeployLogs((prev) => [...prev, "[DEPLOY] Cluster nodes health checks: node-1 (OK) ... node-8 (OK)."]);
      } else if (p === 100) {
        clearInterval(interval);
        setDeployStatus("deployed");
        setModelVersion("v4.2.2-hotpatch");
        setCompletedRepairs((prev) => prev + 1);
        setSystemHealth(99);

        // Add history timeline entry
        const entry: TimelineEntry = {
          id: `patch-${Date.now()}`,
          timestamp: new Date().toISOString().replace("T", " ").substring(0, 19),
          version: "v4.2.2-hotpatch",
          failureType: activeFailure === "none" ? "Proactive Maintenance" : activeFailure.toUpperCase(),
          strategy: recommendedStrategy,
          validationResult: `SAFE (${verificationMetrics.accuracy}% Acc)`,
          operator: appMode === "loop" ? "SYSTEM/AUTO" : "ADMIN/SURGICAL",
        };
        setTimeline((prev) => [entry, ...prev]);

        // Mark isolated / repaired layers
        setLayers((prev) =>
          prev.map((l) => {
            if (selectedLayers.includes(l.id)) {
              return { ...l, status: "repaired" };
            }
            return l;
          })
        );

        // Reset system failure back to healthy
        setActiveFailure("none");
        setRiskLevel("low");
        setFailureSig({ adv: 0.02, drift: 0.03, bias: 0.01, backdoor: 0.01 });
        setTelemetry({
          confidence: 94.5,
          gpuUtil: 60.2,
          memory: 14.1,
          latency: 12.2,
          driftScore: 0.012,
          biasScore: 0.006,
        });

        addLog("SUCCESS: Version v4.2.2-hotpatch active. Telemetry nominal.", "success");
        setToastMessage("Deploy successful! Model updated to v4.2.2-hotpatch.");
        setTimeout(() => setToastMessage(null), 4000);

        // Trigger confetti
        confetti({
          particleCount: 120,
          spread: 70,
          origin: { y: 0.6 },
          colors: ["#3b82f6", "#10b981", "#6366f1"],
        });
      }
    }, 500);
  };

  // Toggle app mode
  const handleModeChange = (mode: Mode) => {
    setAppMode(mode);
    addLog(`[SYSTEM] Switched UI mode: ${mode === "loop" ? "Automated Repair Loop" : "Manual Surgical Mode"}.`, "system");
  };

  // Layer calculations
  const calculateRepairMetrics = () => {
    if (selectedLayers.length === 0) {
      return { cost: 0, accuracy: "94.2%", time: "0s", compute: "0" };
    }
    const layerCount = selectedLayers.length;
    let baseTime = 0;
    let baseCompute = 0;

    switch (repairOp) {
      case "weight":
        baseTime = 12;
        baseCompute = 4.2;
        break;
      case "mask":
        baseTime = 4;
        baseCompute = 1.1;
        break;
      case "freeze":
        baseTime = 2;
        baseCompute = 0.5;
        break;
      case "lowrank":
        baseTime = 18;
        baseCompute = 6.8;
        break;
      case "reset":
        baseTime = 8;
        baseCompute = 2.5;
        break;
      case "gradient":
        baseTime = 24;
        baseCompute = 9.4;
        break;
    }

    const cost = Math.round(layerCount * 125 * (coefBeta + 0.5));
    const time = `${Math.round(layerCount * baseTime * (1.2 - coefBeta * 0.4))}s`;
    const compute = (layerCount * baseCompute * (1.5 - coefBeta * 0.5)).toFixed(2);
const expectedAcc = `${(94.2 - layerCount * 0.4 + (repairOp === "gradient" ? 0.6 : 0)).toFixed(1)}%`;

    return { cost, accuracy: expectedAcc, time, compute };
  };

  const repairMetrics = calculateRepairMetrics();

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans relative antialiased selection:bg-blue-500/20 selection:text-blue-900">
      {/* Toast notifications */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -40, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className="fixed top-6 left-1/2 transform -translate-x-1/2 z-50 flex items-center gap-3 px-6 py-3.5 border rounded-2xl shadow-xl bg-white/95 border-slate-200 text-slate-900 max-w-md backdrop-blur-md"
          >
            {toastMessage.includes("Critical") || toastMessage.includes("Warning") ? (
              <div className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping" />
            ) : (
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
            )}
            <span className="text-sm font-semibold tracking-wide">{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* HEADER SECTION */}
      <header className="h-16 border-b border-slate-200 bg-white sticky top-0 z-40 px-6 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-4">
          {/* Hamburger toggle */}
          <button
            onClick={() => setIsSidebarExpanded(!isSidebarExpanded)}
            className="p-2 rounded-xl text-slate-500 hover:bg-slate-100 hover:text-slate-800 transition focus:outline-none cursor-pointer"
            aria-label="Toggle Sidebar"
          >
            <Menu className="w-5.5 h-5.5" />
          </button>

          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 shadow-md shadow-blue-500/20">
              <Cpu className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base font-bold tracking-tight text-slate-900">
                  UniRepairNet
                </h1>
                <span className="px-1.5 py-0.5 text-[9px] font-semibold font-mono tracking-widest bg-blue-50 border border-blue-200/50 text-blue-600 rounded">
                  CORE FRAMEWORK
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Live Cluster Indicators */}
        <div className="hidden lg:flex items-center gap-5 bg-slate-50 border border-slate-200/60 rounded-xl px-4 py-2 text-xs text-slate-600 font-mono">
          <div className="flex items-center gap-2">
            <span className={`w-2 h-2 rounded-full ${activeFailure !== "none" ? "bg-amber-500 animate-pulse" : "bg-emerald-500 animate-pulse"}`} />
            <span>Cluster: <strong className="text-slate-800">{activeFailure !== "none" ? "Degraded" : "Nominal"}</strong></span>
          </div>
          <div className="h-3.5 w-px bg-slate-200" />
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-blue-500" />
            <span>Active: <strong className="text-slate-800">12 Models</strong></span>
          </div>
          <div className="h-3.5 w-px bg-slate-200" />
          <div className="flex items-center gap-2">
            <span className={`w-2 h-2 rounded-full ${repairStatus === "running" ? "bg-indigo-500 animate-spin" : "bg-slate-400"}`} />
            <span>Queue: <strong className="text-slate-800">{repairStatus === "running" ? "1" : "0"}</strong></span>
          </div>
          <div className="h-3.5 w-px bg-slate-200" />
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Monitor: <strong className="text-emerald-600">ACTIVE</strong></span>
          </div>
        </div>

        {/* Action Toggle Switch */}
        <div className="flex items-center gap-3">
          <div className="flex items-center bg-slate-100 p-0.5 border border-slate-200 rounded-xl">
            <button
              onClick={() => handleModeChange("loop")}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold tracking-wide transition-all ${
                appMode === "loop"
                  ? "bg-blue-600 text-white shadow-sm"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Auto-Repair Loop
            </button>
            <button
              onClick={() => handleModeChange("manual-surgical")}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold tracking-wide transition-all ${
                appMode === "manual-surgical"
                  ? "bg-blue-600 text-white shadow-sm"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Manual Surgical Mode
            </button>
          </div>
        </div>
      </header>

      <div className="flex flex-1 relative">
        {/* LEFT COLLAPSIBLE NAVIGATION SIDEBAR */}
        <aside
          className={`sticky top-16 left-0 h-[calc(100vh-64px)] border-r border-slate-200 bg-white flex flex-col transition-all duration-300 ease-in-out shrink-0 z-30 ${
            isSidebarExpanded ? "w-64" : "w-20"
          }`}
        >
          <div className="flex-1 py-4 space-y-1.5 px-3 overflow-y-auto">
            {[
              { id: "dashboard", label: "Dashboard", icon: Home },
              { id: "telemetry", label: "Live Telemetry", icon: Activity },
              { id: "classification", label: "Classification Engine", icon: Shield },
              { id: "sandbox", label: "Surgical Sandbox", icon: Layers },
              { id: "pipeline", label: "Verification Pipeline", icon: Network },
              { id: "history", label: "Patch History", icon: Clock },
            ].map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center gap-3.5 py-3 px-3.5 rounded-xl text-left transition-all duration-200 group cursor-pointer ${
                    isActive
                      ? "bg-blue-50 text-blue-600 font-semibold shadow-sm"
                      : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                  }`}
                >
                  <Icon className={`w-5 h-5 flex-shrink-0 transition-transform ${isActive ? "text-blue-600" : "text-slate-500 group-hover:text-slate-900"}`} />
                  <span
                    className={`text-sm tracking-wide truncate transition-all duration-300 ${
                      isSidebarExpanded ? "opacity-100 max-w-full" : "opacity-0 max-w-0 overflow-hidden"
                    }`}
                  >
                    {item.label}
                  </span>
                </button>
              );
            })}
          </div>

          <div className="p-4 border-t border-slate-100 flex items-center justify-center">
            {isSidebarExpanded ? (
              <div className="w-full bg-slate-50 border border-slate-150 rounded-xl p-2.5 text-center">
                <span className="text-[10px] text-slate-500 font-bold block">ACTIVE VERSION</span>
                <span className="text-xs font-mono font-bold text-blue-600">{modelVersion}</span>
              </div>
            ) : (
              <span className="text-[10px] font-mono font-extrabold text-blue-600 bg-blue-50 border border-blue-100 rounded px-1.5 py-0.5">
                v4.2
              </span>
            )}
          </div>
        </aside>

        {/* MAIN CONTENT WORKSPACE AREA */}
        <main className="flex-1 bg-slate-50 p-6 overflow-y-auto grid-bg relative">
          <div className="max-w-7xl mx-auto space-y-6">

            {/* Render Selected View */}
            {activeTab === "dashboard" && (
              <div className="space-y-6">
                {/* Dashboard Key Metrics Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {/* Active Anomaly Status */}
                  <div className="bg-white border border-slate-200 shadow-sm rounded-2xl p-5 flex flex-col justify-between">
                    <div>
                      <span className="text-[10px] font-mono text-slate-500 block uppercase tracking-wider">Active Threat Anomaly</span>
                      <span className={`text-lg font-bold block mt-1 truncate ${activeFailure !== "none" ? "text-rose-600 animate-pulse" : "text-emerald-600"}`}>
                        {activeFailure === "none" ? "NONE (NOMINAL)" : activeFailure.toUpperCase()}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mt-2">
                      {activeFailure === "none"
                        ? "All systems operational within safety limits."
                        : `Neural weight values show active distortion patterns.`}
                    </p>
                  </div>

                  {/* System Health */}
                  <div className="bg-white border border-slate-200 shadow-sm rounded-2xl p-5 flex flex-col justify-between">
                    <div>
                      <span className="text-[10px] font-mono text-slate-500 block uppercase tracking-wider">Cluster System Health</span>
                      <span className="text-2xl font-bold font-mono text-slate-900 block mt-1">{systemHealth}%</span>
                    </div>
                    <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden mt-3">
                      <div className="bg-emerald-500 h-full rounded-full" style={{ width: `${systemHealth}%` }} />
                    </div>
                  </div>

                  {/* Active Version */}
                  <div className="bg-white border border-slate-200 shadow-sm rounded-2xl p-5 flex flex-col justify-between">
                    <div>
                      <span className="text-[10px] font-mono text-slate-500 block uppercase tracking-wider">Active Production Version</span>
                      <span className="text-base font-bold text-blue-600 font-mono block mt-1.5 truncate">{modelVersion}</span>
                    </div>
                    <p className="text-xs text-slate-500 mt-2">
                      Zero-downtime hot patches applied dynamically.
                    </p>
                  </div>

                  {/* Verification Proof Badge */}
                  <div className="bg-white border border-slate-200 shadow-sm rounded-2xl p-5 flex flex-col justify-between">
                    <div>
                      <span className="text-[10px] font-mono text-slate-500 block uppercase tracking-wider">Formal SMT Certificate</span>
                      <span className={`text-lg font-bold block mt-1 uppercase ${
                        verificationBadge === "safe" || verificationBadge === "authorized"
                          ? "text-emerald-600"
                          : verificationBadge === "counterexample"
                          ? "text-rose-600"
                          : "text-slate-500"
                      }`}>
                        {verificationBadge !== "idle" ? verificationBadge : "PENDING"}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mt-2">
                      Proof certification outputs from SMT solver pipeline.
                    </p>
                  </div>
                </div>

                {/* Dashboard Main Split Column Layout */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                  
                  {/* Left Column Overview */}
                  <div className="lg:col-span-8 space-y-6">
                    {/* Welcome Banner Card */}
                    <div className="bg-white border border-slate-200 shadow-sm rounded-2xl p-6 relative overflow-hidden">
                      <div className="absolute -right-10 -bottom-10 opacity-5 pointer-events-none">
                        <Cpu className="w-56 h-56 text-slate-900" />
                      </div>
                      <h2 className="text-lg font-bold text-slate-900 mb-2">UniRepairNet MLOps Dashboard</h2>
                      <p className="text-sm text-slate-600 leading-relaxed max-w-xl">
                        A Unified Academic Demonstration Platform for deep neural network vulnerability detection, empirical accuracy assessment, and formal validation. Choose a failure state below or switch tabs on the sidebar to inspect parameters, models, and patch timelines.
                      </p>
                      <div className="flex flex-wrap items-center gap-6 mt-5 text-xs text-slate-500 font-mono">
                        <span className="flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                          GPU Cluster Status: Active (8x H100)
                        </span>
                        <span className="flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full bg-blue-500" />
                          Monitored Model Instances: 12
                        </span>
                      </div>
                    </div>

                    {/* Threat Simulator Injector */}
                    <div className="bg-white border border-slate-200 shadow-sm rounded-2xl p-5">
                      <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-3 mb-4">
                        Failure Threat Injection Center
                      </h3>
                      <p className="text-xs text-slate-500 mb-4 leading-relaxed">
                        Inject custom failure patterns representing production issues. This dynamically alters telemetry sensors, triggers warnings, and updates optimization functions.
                      </p>
                      <div className="flex flex-wrap gap-3">
                        <button
                          onClick={() => handleInjectFailure("adversarial")}
                          disabled={repairStatus === "running"}
                          className="px-3.5 py-2 text-xs font-semibold font-mono border border-rose-200 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-xl transition cursor-pointer disabled:opacity-50"
                        >
                          + ADVERSARIAL ATTACK
                        </button>
                        <button
                          onClick={() => handleInjectFailure("drift")}
                          disabled={repairStatus === "running"}
                          className="px-3.5 py-2 text-xs font-semibold font-mono border border-amber-200 bg-amber-50 hover:bg-amber-100 text-amber-700 rounded-xl transition cursor-pointer disabled:opacity-50"
                        >
                          + CONCEPT DRIFT
                        </button>
                        <button
                          onClick={() => handleInjectFailure("bias")}
                          disabled={repairStatus === "running"}
                          className="px-3.5 py-2 text-xs font-semibold font-mono border border-indigo-200 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-xl transition cursor-pointer disabled:opacity-50"
                        >
                          + DEMOGRAPHIC BIAS
                        </button>
                        <button
                          onClick={() => handleInjectFailure("backdoor")}
                          disabled={repairStatus === "running"}
                          className="px-3.5 py-2 text-xs font-semibold font-mono border border-purple-200 bg-purple-50 hover:bg-purple-100 text-purple-700 rounded-xl transition cursor-pointer disabled:opacity-50"
                        >
                          + TROJAN BACKDOOR
                        </button>
                        <button
                          onClick={() => handleInjectFailure("random")}
                          disabled={repairStatus === "running"}
                          className="px-3.5 py-2 text-xs font-semibold font-mono border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 rounded-xl transition cursor-pointer disabled:opacity-50"
                        >
                          + GENERAL MALFUNCTION
                        </button>
                        {activeFailure !== "none" && (
                          <button
                            onClick={() => handleInjectFailure("none")}
                            disabled={repairStatus === "running"}
                            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold font-mono border border-emerald-250 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-xl transition cursor-pointer"
                          >
                            <RotateCcw className="w-3.5 h-3.5" /> DISMISS STATE
                          </button>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Right Column Stats */}
                  <div className="lg:col-span-4 space-y-6">
                    {/* Session Summary info */}
                    <div className="bg-white border border-slate-200 shadow-sm rounded-2xl p-5 space-y-4">
                      <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-3 uppercase tracking-wider">
                        Current Session State
                      </h3>

                      <div className="space-y-3.5 text-xs">
                        <div>
                          <span className="text-[10px] font-mono text-slate-500 block uppercase">Detected Failure</span>
                          <span className={`font-bold block mt-0.5 ${activeFailure !== "none" ? "text-rose-600" : "text-emerald-600"}`}>
                            {activeFailure === "none" ? "NONE (NOMINAL OPERATION)" : activeFailure.toUpperCase()}
                          </span>
                        </div>

                        <div>
                          <span className="text-[10px] font-mono text-slate-500 block uppercase">Recommended Strategy</span>
                          <span className="font-bold block text-slate-800 mt-0.5">
                            {recommendedStrategy}
                          </span>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <span className="text-[10px] font-mono text-slate-500 block uppercase">Risk Threat Level</span>
                            <span className={`font-bold block mt-0.5 uppercase ${
                              riskLevel === "critical"
                                ? "text-rose-600"
                                : riskLevel === "high"
                                ? "text-amber-600"
                                : riskLevel === "medium"
                                ? "text-indigo-600"
                                : "text-emerald-600"
                            }`}>
                              {riskLevel}
                            </span>
                          </div>
                          <div>
                            <span className="text-[10px] font-mono text-slate-500 block uppercase">Verification Badge</span>
                            <span className={`font-bold block mt-0.5 uppercase ${
                              verificationBadge === "safe" || verificationBadge === "authorized"
                                ? "text-emerald-600"
                                : verificationBadge === "counterexample"
                                ? "text-rose-600"
                                : "text-slate-400"
                            }`}>
                              {verificationBadge !== "idle" ? verificationBadge : "PENDING"}
                            </span>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <span className="text-[10px] font-mono text-slate-500 block uppercase">Estimated Repair Cost</span>
                            <span className="font-bold block text-slate-800 mt-0.5">
                              {selectedLayers.length === 0 ? "$0" : `$${repairMetrics.cost}`}
                            </span>
                          </div>
                          <div>
                            <span className="text-[10px] font-mono text-slate-500 block uppercase">Estimated Repair Time</span>
                            <span className="font-bold block text-slate-800 mt-0.5">
                              {selectedLayers.length === 0 ? "0s" : repairMetrics.time}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Global Platform Metrics */}
                    <div className="bg-white border border-slate-200 shadow-sm rounded-2xl p-5 space-y-4">
                      <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-3 uppercase tracking-wider">
                        Platform Operations
                      </h3>

                      <div className="space-y-3">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-slate-500">Active Models</span>
                          <span className="font-bold font-mono text-slate-800">12 / 12</span>
                        </div>

                        <div className="flex items-center justify-between text-xs">
                          <span className="text-slate-500">Pending Operations</span>
                          <span className="font-bold font-mono text-slate-800">{repairStatus === "running" ? "1" : "0"}</span>
                        </div>

                        <div className="flex items-center justify-between text-xs">
                          <span className="text-slate-500">Completed Operations</span>
                          <span className="font-bold font-mono text-emerald-600">{completedRepairs}</span>
                        </div>

                        <div className="flex items-center justify-between text-xs">
                          <span className="text-slate-500">Cluster Health Status</span>
                          <span className="font-bold font-mono text-emerald-600">{systemHealth}%</span>
                        </div>

                        <div className="bg-slate-50 border border-slate-150 p-2.5 rounded-xl flex items-center justify-between gap-1.5 font-mono text-[9px] text-slate-500 mt-2">
                          <TrendingUp className="w-4 h-4 text-emerald-500" />
                          <span>ACCURACY: STABLE (&gt;90% REQUIREMENT)</span>
                        </div>
                      </div>
                    </div>
                  </div>

                </div>
              </div>
            )}

            {activeTab === "telemetry" && (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                {/* Telemetry Sensor Dashboard (Left: 4 cols) */}
                <div className="lg:col-span-4 bg-white border border-slate-200 shadow-sm rounded-2xl p-5 flex flex-col justify-between min-h-[360px]">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <div className="flex items-center gap-2">
                      <Activity className="w-4 h-4 text-blue-600 animate-pulse" />
                      <h2 className="text-sm font-bold text-slate-900">Live Telemetry Sensors</h2>
                    </div>
                    <span className="px-1.5 py-0.5 rounded text-[9px] font-mono bg-slate-100 border border-slate-200 text-slate-500 font-bold">
                      REAL-TIME
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-4 my-5">
                    <div className="bg-slate-50 border border-slate-100 p-3 rounded-xl">
                      <div className="text-[9px] text-slate-500 font-mono font-bold">ACCURACY CONFIDENCE</div>
                      <div className="text-xl font-bold font-mono mt-1 flex items-baseline gap-1 text-slate-900">
                        {telemetry.confidence}%
                        <span className={`text-[10px] font-normal ${activeFailure !== "none" ? "text-rose-500" : "text-emerald-500"}`}>
                          {activeFailure !== "none" ? "↓" : "↑"}
                        </span>
                      </div>
                    </div>

                    <div className="bg-slate-50 border border-slate-100 p-3 rounded-xl">
                      <div className="text-[9px] text-slate-500 font-mono font-bold">LATENCY (P99)</div>
                      <div className="text-xl font-bold font-mono mt-1 text-slate-900">
                        {telemetry.latency}ms
                      </div>
                    </div>

                    <div className="bg-slate-50 border border-slate-100 p-3 rounded-xl">
                      <div className="text-[9px] text-slate-500 font-mono font-bold">GPU COMPUTE LOAD</div>
                      <div className="text-xl font-bold font-mono mt-1 text-slate-900">
                        {telemetry.gpuUtil}%
                      </div>
                    </div>

                    <div className="bg-slate-50 border border-slate-100 p-3 rounded-xl">
                      <div className="text-[9px] text-slate-500 font-mono font-bold">ACTIVE MEM LOAD</div>
                      <div className="text-xl font-bold font-mono mt-1 text-slate-900">
                        {telemetry.memory} GB
                      </div>
                    </div>
                  </div>

                  {/* Actions inside telemetry view to easily see log updates */}
                  <div className="pt-3 border-t border-slate-100 space-y-3">
                    <div className="flex justify-between items-center text-[10px] font-mono text-slate-500">
                      <span>QUICK THREAT CONTROLS:</span>
                    </div>
                    <div className="flex gap-2 flex-wrap">
                      <button
                        onClick={() => handleInjectFailure("adversarial")}
                        disabled={repairStatus === "running"}
                        className="px-2 py-1 text-[9px] font-bold font-mono border border-rose-200 bg-rose-50 text-rose-600 rounded-md hover:bg-rose-100 transition cursor-pointer"
                      >
                        + ADV
                      </button>
                      <button
                        onClick={() => handleInjectFailure("drift")}
                        disabled={repairStatus === "running"}
                        className="px-2 py-1 text-[9px] font-bold font-mono border border-amber-200 bg-amber-50 text-amber-600 rounded-md hover:bg-amber-100 transition cursor-pointer"
                      >
                        + DRIFT
                      </button>
                      <button
                        onClick={() => handleInjectFailure("bias")}
                        disabled={repairStatus === "running"}
                        className="px-2 py-1 text-[9px] font-bold font-mono border border-indigo-200 bg-indigo-50 text-indigo-650 rounded-md hover:bg-indigo-100 transition cursor-pointer"
                      >
                        + BIAS
                      </button>
                      <button
                        onClick={() => handleInjectFailure("none")}
                        className="px-2 py-1 text-[9px] font-bold font-mono border border-slate-200 bg-slate-50 text-slate-600 rounded-md hover:bg-slate-100 transition ml-auto cursor-pointer"
                      >
                        RESET
                      </button>
                    </div>
                  </div>
                </div>

                {/* Console Log Feed (Right: 8 cols) */}
                <div className="lg:col-span-8 bg-white border border-slate-200 shadow-sm rounded-2xl p-5 flex flex-col min-h-[360px]">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <div className="flex items-center gap-2">
                      <Terminal className="w-4 h-4 text-slate-700" />
                      <h2 className="text-sm font-bold text-slate-900">Live Telemetry Terminal Console</h2>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                      <span className="text-[10px] font-mono text-slate-400">LISTENING</span>
                    </div>
                  </div>

                  {/* Dark console text window */}
                  <div className="flex-1 overflow-y-auto font-mono text-[11px] space-y-1.5 my-4 p-4 bg-slate-950 border border-slate-900 rounded-xl relative scanline min-h-[220px] max-h-[320px]">
                    {logs.length === 0 ? (
                      <div className="text-slate-505 italic">Console starting and reading live metrics...</div>
                    ) : (
                      logs.map((log, idx) => (
                        <div key={idx} className="leading-5">
                          <span className="text-slate-500 mr-2">[{log.timestamp}]</span>
                          <span
                            className={`font-semibold mr-1.5 ${
                              log.type === "error"
                                ? "text-rose-400"
                                : log.type === "warning"
                                ? "text-amber-450"
                                : log.type === "success"
                                ? "text-emerald-400"
                                : log.type === "system"
                                ? "text-blue-400"
                                : "text-slate-300"
                            }`}
                          >
                            {log.type.toUpperCase()}:
                          </span>
                          <span className="text-slate-200">{log.message}</span>
                        </div>
                      ))
                    )}
                    <div ref={terminalEndRef} />
                  </div>
                </div>
              </div>
            )}

            {activeTab === "classification" && (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                {/* Attack Vectors Gauges (Left: 5 cols) */}
                <div className="lg:col-span-5 bg-white border border-slate-200 shadow-sm rounded-2xl p-5 flex flex-col justify-between min-h-[380px]">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <div className="flex items-center gap-2">
                      <Shield className="w-4 h-4 text-slate-700" />
                      <h2 className="text-sm font-bold text-slate-900">Failure Classification Engine</h2>
                    </div>
                    <span
                      className={`font-bold tracking-wider px-2 py-0.5 rounded text-[9px] font-mono border ${
                        riskLevel === "critical"
                          ? "bg-rose-50 text-rose-600 border-rose-250 animate-pulse"
                          : riskLevel === "high"
                          ? "bg-amber-50 text-amber-600 border-amber-250"
                          : riskLevel === "medium"
                          ? "bg-indigo-50 text-indigo-600 border-indigo-250"
                          : "bg-emerald-50 text-emerald-600 border-emerald-250"
                      }`}
                    >
                      {riskLevel.toUpperCase()} RISK
                    </span>
                  </div>

                  {/* Classification vectors */}
                  <div className="space-y-4 my-5 flex-1 flex flex-col justify-center">
                    {/* ADV */}
                    <div>
                      <div className="flex items-center justify-between text-xs font-mono mb-1 text-slate-600">
                        <span className="flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                          Adversarial Vector (F_adv)
                        </span>
                        <span className="font-semibold text-slate-800">{Math.round(failureSig.adv * 100)}%</span>
                      </div>
                      <div className="w-full bg-slate-100 border border-slate-200/50 h-2 rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${failureSig.adv * 100}%` }}
                          transition={{ duration: 0.5 }}
                          className="bg-rose-500 h-full rounded-full"
                        />
                      </div>
                    </div>

                    {/* DRIFT */}
                    <div>
                      <div className="flex items-center justify-between text-xs font-mono mb-1 text-slate-600">
                        <span className="flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                          Concept Drift Vector (F_drift)
                        </span>
                        <span className="font-semibold text-slate-800">{Math.round(failureSig.drift * 100)}%</span>
                      </div>
                      <div className="w-full bg-slate-100 border border-slate-200/50 h-2 rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${failureSig.drift * 100}%` }}
                          transition={{ duration: 0.5 }}
                          className="bg-amber-500 h-full rounded-full"
                        />
                      </div>
                    </div>

                    {/* BIAS */}
                    <div>
                      <div className="flex items-center justify-between text-xs font-mono mb-1 text-slate-600">
                        <span className="flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                          Demographic Bias Vector (F_bias)
                        </span>
                        <span className="font-semibold text-slate-800">{Math.round(failureSig.bias * 100)}%</span>
                      </div>
                      <div className="w-full bg-slate-100 border border-slate-200/50 h-2 rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${failureSig.bias * 100}%` }}
                          transition={{ duration: 0.5 }}
                          className="bg-blue-600 h-full rounded-full"
                        />
                      </div>
                    </div>

                    {/* BACKDOOR */}
                    <div>
                      <div className="flex items-center justify-between text-xs font-mono mb-1 text-slate-600">
                        <span className="flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-purple-500" />
                          Backdoor Signature (F_backdoor)
                        </span>
                        <span className="font-semibold text-slate-800">{Math.round(failureSig.backdoor * 100)}%</span>
                      </div>
                      <div className="w-full bg-slate-100 border border-slate-200/50 h-2 rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${failureSig.backdoor * 100}%` }}
                          transition={{ duration: 0.5 }}
                          className="bg-purple-500 h-full rounded-full"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="border-t border-slate-100 pt-3 bg-slate-50 p-3 rounded-xl border border-slate-150">
                    <div className="flex items-center gap-2">
                      <Zap className="w-4 h-4 text-amber-500" />
                      <span className="text-[10px] font-mono text-slate-500 font-bold uppercase">
                        CLASSIFIER SUMMARY STATUS:
                      </span>
                    </div>
                    <p className="text-xs text-slate-800 mt-1 font-semibold">
                      {activeFailure === "none"
                        ? "✓ Nominal latent weights verified. No threats matched."
                        : `✗ Active anomaly matched: ${activeFailure.toUpperCase()}`}
                    </p>
                  </div>
                </div>

                {/* Strategy Selector (Right: 7 cols) */}
                <div className="lg:col-span-7 bg-white border border-slate-200 shadow-sm rounded-2xl p-5 flex flex-col justify-between min-h-[380px]">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <div className="flex items-center gap-2">
                      <Sliders className="w-4 h-4 text-blue-600" />
                      <h2 className="text-sm font-bold text-slate-900">Intelligent Strategy Optimizer</h2>
                    </div>
                    <div className="flex items-center bg-slate-100 p-0.5 border border-slate-200 rounded-lg">
                      <button
                        onClick={() => setOptimizationMode("auto")}
                        className={`px-2.5 py-1 text-[10px] font-bold font-mono rounded-md transition cursor-pointer ${
                          optimizationMode === "auto" ? "bg-blue-600 text-white" : "text-slate-500 hover:text-slate-700"
                        }`}
                      >
                        AUTO
                      </button>
                      <button
                        onClick={() => setOptimizationMode("manual")}
                        className={`px-2.5 py-1 text-[10px] font-bold font-mono rounded-md transition cursor-pointer ${
                          optimizationMode === "manual" ? "bg-blue-600 text-white" : "text-slate-500 hover:text-slate-700"
                        }`}
                      >
                        MANUAL
                      </button>
                    </div>
                  </div>

                  {/* Math Formula Container */}
                  <div className="my-3 py-2.5 px-4 bg-slate-50 border border-slate-150 rounded-xl flex items-center justify-center font-mono text-xs text-slate-700 text-center">
                    <div>
                      <div className="text-[9px] text-slate-400 font-bold mb-1 tracking-wider uppercase">Loss Optimization Objective Function</div>
                      <div className="flex items-center gap-1 justify-center flex-wrap">
                        <span className="text-slate-800 font-semibold">L_total =</span>
                        <span className="text-blue-600 font-bold">({coefAlpha.toFixed(2)})</span>
                        <span className="text-slate-500">L_task +</span>
                        <span className="text-emerald-600 font-bold">({coefBeta.toFixed(2)})</span>
                        <span className="text-slate-500">L_repair +</span>
                        <span className="text-amber-600 font-bold">({coefGamma.toFixed(2)})</span>
                        <span className="text-slate-500">L_complexity +</span>
                        <span className="text-purple-600 font-bold">({coefDelta.toFixed(2)})</span>
                        <span className="text-slate-500">L_safety</span>
                      </div>
                    </div>
                  </div>

                  {/* Sliders Grid */}
                  <div className="grid grid-cols-2 gap-4 my-2">
                    <div>
                      <div className="flex justify-between text-[11px] font-mono text-slate-500 mb-1">
                        <span>Task Accuracy (α)</span>
                        <span className="text-blue-650 font-bold">{coefAlpha}</span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="1"
                        step="0.05"
                        value={coefAlpha}
                        disabled={optimizationMode === "auto"}
                        onChange={(e) => setCoefAlpha(parseFloat(e.target.value))}
                        className="w-full accent-blue-600 bg-slate-100 border border-slate-200 rounded-lg cursor-pointer h-1.5"
                      />
                    </div>

                    <div>
                      <div className="flex justify-between text-[11px] font-mono text-slate-500 mb-1">
                        <span>Repair Cost (β)</span>
                        <span className="text-emerald-600 font-bold">{coefBeta}</span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="1"
                        step="0.05"
                        value={coefBeta}
                        disabled={optimizationMode === "auto"}
                        onChange={(e) => setCoefBeta(parseFloat(e.target.value))}
                        className="w-full accent-emerald-600 bg-slate-100 border border-slate-200 rounded-lg cursor-pointer h-1.5"
                      />
                    </div>

                    <div>
                      <div className="flex justify-between text-[11px] font-mono text-slate-500 mb-1">
                        <span>Complexity Limit (γ)</span>
                        <span className="text-amber-650 font-bold">{coefGamma}</span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="1"
                        step="0.05"
                        value={coefGamma}
                        disabled={optimizationMode === "auto"}
                        onChange={(e) => setCoefGamma(parseFloat(e.target.value))}
                        className="w-full accent-amber-600 bg-slate-100 border border-slate-200 rounded-lg cursor-pointer h-1.5"
                      />
                    </div>

                    <div>
                      <div className="flex justify-between text-[11px] font-mono text-slate-500 mb-1">
                        <span>Safety Margin (δ)</span>
                        <span className="text-purple-650 font-bold">{coefDelta}</span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="1"
                        step="0.05"
                        value={coefDelta}
                        disabled={optimizationMode === "auto"}
                        onChange={(e) => setCoefDelta(parseFloat(e.target.value))}
                        className="w-full accent-purple-600 bg-slate-100 border border-slate-200 rounded-lg cursor-pointer h-1.5"
                      />
                    </div>
                  </div>

                  {/* Recommendation Card */}
                  <div className="bg-slate-50 border border-slate-150 p-4 rounded-xl mt-2 relative overflow-hidden">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-[10px] font-mono text-slate-500 font-bold tracking-wider">STRATEGY RECOMMENDATION</span>
                      <div className="flex items-center gap-1 text-xs">
                        <span className="text-[10px] text-slate-400 font-mono">SCORE:</span>
                        <span className="font-mono font-bold text-blue-600">{optimizationScore}/100</span>
                      </div>
                    </div>
                    <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-amber-500" />
                      {recommendedStrategy}
                    </h3>
                    <p className="text-xs text-slate-650 mt-1 leading-relaxed">
                      {strategyRationale}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "sandbox" && (
              <div className="bg-white border border-slate-200 shadow-sm rounded-2xl p-5 space-y-6">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-2">
                    <Layers className="w-4 h-4 text-blue-600 animate-pulse" />
                    <h2 className="text-sm font-bold text-slate-900">Neural Network Layer Surgical Sandbox</h2>
                  </div>
                  <span className="text-[11px] font-mono text-slate-500 font-semibold bg-slate-50 border border-slate-150 px-2 py-0.5 rounded">
                    {selectedLayers.length === 0 ? "Select layers on the map" : `${selectedLayers.length} Layers Selected`}
                  </span>
                </div>

                {/* Layer Map Block */}
                <div className="bg-slate-50 border border-slate-150 rounded-2xl p-6 relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-6 min-h-[190px]">
                  
                  {/* SVG paths between layers */}
                  <div className="absolute inset-0 pointer-events-none hidden md:block opacity-40">
                    <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
                      <path d="M 120 95 L 250 95 M 350 95 L 480 95 M 580 95 L 710 95 M 810 95 L 940 95 M 1040 95 L 1150 95" stroke="#cbd5e1" strokeWidth="2" strokeDasharray="5 5" />
                    </svg>
                  </div>

                  {layers.map((layer) => {
                    const isSelected = selectedLayers.includes(layer.id);
                    return (
                      <motion.div
                        key={layer.id}
                        onClick={() => {
                          if (selectedLayers.includes(layer.id)) {
                            setSelectedLayers(selectedLayers.filter((id) => id !== layer.id));
                          } else {
                            setSelectedLayers([...selectedLayers, layer.id]);
                          }
                        }}
                        className={`relative z-10 w-full md:w-[15%] p-3.5 border rounded-xl cursor-pointer transition-all duration-300 group ${
                          isSelected
                            ? "bg-blue-50 border-blue-500 shadow-sm text-blue-850"
                            : layer.status === "degraded"
                            ? "bg-rose-50 border-rose-400 shadow-sm text-rose-850 animate-pulse-glow"
                            : layer.status === "repaired"
                            ? "bg-emerald-50 border-emerald-400 shadow-sm text-emerald-850"
                            : "bg-white border-slate-200 text-slate-800 hover:border-slate-350"
                        }`}
                        whileHover={{ scale: 1.03 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        {/* Hover Tooltip parameters info */}
                        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-3 bg-white border border-slate-200 p-3 rounded-xl opacity-0 group-hover:opacity-100 transition duration-200 pointer-events-none w-56 z-50 text-[10px] font-mono space-y-1.5 shadow-xl text-slate-700">
                          <div className="font-bold text-slate-900 border-b border-slate-100 pb-1.5">{layer.name}</div>
                          <div className="flex justify-between">
                            <span className="text-slate-400">Neurons count:</span>
                            <span className="text-slate-800 font-bold">{layer.neurons}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-400">Memory footprint:</span>
                            <span className="text-slate-800 font-bold">{layer.memory}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-400">Trainable parameters:</span>
                            <span className="text-slate-800 font-bold">{layer.trainable.toLocaleString()}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-400">Layer status:</span>
                            <span className={`font-bold ${
                              layer.status === "nominal"
                                ? "text-emerald-600"
                                : layer.status === "repaired"
                                ? "text-emerald-600"
                                : "text-rose-600"
                            }`}>
                              {layer.status.toUpperCase()}
                            </span>
                          </div>
                        </div>

                        <div className="flex justify-between items-start mb-2">
                          <span className="text-[9px] font-bold text-slate-400 font-mono tracking-wider uppercase">{layer.type}</span>
                          {layer.status === "degraded" && (
                            <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping" />
                          )}
                          {layer.status === "repaired" && (
                            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                          )}
                        </div>
                        <h4 className="text-xs font-bold truncate">{layer.name}</h4>
                        <p className="text-[10px] text-slate-500 font-mono mt-1">
                          {layer.neurons} neurons
                        </p>
                      </motion.div>
                    );
                  })}
                </div>

                {/* Operations Sandbox panel */}
                <div className="grid grid-cols-1 md:grid-cols-12 gap-6 pt-5 border-t border-slate-100">
                  {/* Mode selector (Left: 5 cols) */}
                  <div className="md:col-span-5">
                    <h4 className="text-xs font-bold text-slate-500 font-mono mb-3 uppercase tracking-wider">Select Repair Operation</h4>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      {[
                        { id: "weight", name: "Weight Repair" },
                        { id: "mask", name: "Neuron Masking" },
                        { id: "freeze", name: "Layer Freezing" },
                        { id: "lowrank", name: "Low-Rank Adapter" },
                        { id: "reset", name: "Parameter Reset" },
                        { id: "gradient", name: "Gradient Surgery" },
                      ].map((op) => (
                        <label
                          key={op.id}
                          className={`flex items-center gap-2.5 p-3 rounded-xl border cursor-pointer select-none transition ${
                            repairOp === op.id
                              ? "bg-blue-50 border-blue-450 text-blue-700 font-semibold"
                              : "bg-white border-slate-200 text-slate-650 hover:bg-slate-55"
                          }`}
                        >
                          <input
                            type="radio"
                            name="repairOp"
                            value={op.id}
                            checked={repairOp === op.id}
                            onChange={() => setRepairOp(op.id as RepairOp)}
                            className="hidden"
                          />
                          <div className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center ${
                            repairOp === op.id ? "border-blue-500" : "border-slate-300"
                          }`}>
                            {repairOp === op.id && <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />}
                          </div>
                          <span className="truncate">{op.name}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Estimate detail metrics (Right: 7 cols) */}
                  <div className="md:col-span-7 bg-slate-50 border border-slate-150 rounded-xl p-4 flex flex-col justify-between">
                    <div className="grid grid-cols-4 gap-2 text-center">
                      <div>
                        <div className="text-[9px] text-slate-500 font-mono font-bold">EST COMPUTE</div>
                        <div className="text-base font-bold font-mono text-slate-800 mt-1">
                          {repairMetrics.compute} <span className="text-[10px] font-normal text-slate-450 font-sans">TF</span>
                        </div>
                      </div>
                      <div>
                        <div className="text-[9px] text-slate-500 font-mono font-bold">ACCURACY EST</div>
                        <div className="text-base font-bold font-mono text-emerald-605 mt-1">{repairMetrics.accuracy}</div>
                      </div>
                      <div>
                        <div className="text-[9px] text-slate-500 font-mono font-bold">REPAIR TIME</div>
                        <div className="text-base font-bold font-mono text-slate-800 mt-1">{repairMetrics.time}</div>
                      </div>
                      <div>
                        <div className="text-[9px] text-slate-500 font-mono font-bold">SANDBOX COST</div>
                        <div className="text-base font-bold font-mono text-amber-605 mt-1">${repairMetrics.cost}</div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between border-t border-slate-150 pt-3 mt-3">
                      <div className="flex items-center gap-1.5 text-xs text-slate-550 leading-none">
                        <Info className="w-3.5 h-3.5 text-slate-400" />
                        Select layers and click run repair.
                      </div>
                      
                      <button
                        onClick={handleExecuteRepair}
                        disabled={repairStatus === "running" || selectedLayers.length === 0}
                        className="flex items-center gap-2 bg-blue-600 text-white font-semibold text-xs py-2.5 px-5 rounded-xl hover:bg-blue-700 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed transition cursor-pointer"
                      >
                        {repairStatus === "running" ? (
                          <>
                            <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                            SOLVING MODEL...
                          </>
                        ) : (
                          <>
                            <Play className="w-3.5 h-3.5 fill-current" />
                            EXECUTE REPAIR
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "pipeline" && (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                
                {/* Pipelines validation block (Left: 8 cols) */}
                <div className="lg:col-span-8 bg-white border border-slate-200 shadow-sm rounded-2xl p-5 flex flex-col justify-between min-h-[380px]">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <div className="flex items-center gap-2">
                      <Network className="w-4 h-4 text-slate-700" />
                      <h2 className="text-sm font-bold text-slate-900">Dual Verification Solver Pipeline</h2>
                    </div>

                    {repairStatus !== "idle" && (
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] text-slate-400 font-mono font-bold">SMT STATUS:</span>
                        <span className={`px-2 py-0.5 text-[9px] font-bold font-mono tracking-wider border rounded ${
                          verificationBadge === "safe"
                            ? "bg-emerald-50 text-emerald-600 border-emerald-205"
                            : verificationBadge === "authorized"
                            ? "bg-teal-50 text-teal-650 border-teal-205"
                            : verificationBadge === "warning"
                            ? "bg-amber-50 text-amber-650 border-amber-205 animate-pulse"
                            : verificationBadge === "counterexample"
                            ? "bg-rose-50 text-rose-600 border-rose-205"
                            : "bg-slate-100 text-slate-500 border-slate-205"
                        }`}>
                          {verificationBadge.toUpperCase()}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Progress slider bar */}
                  <div className="my-4">
                    <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 font-bold mb-1.5">
                      <span>SOLVER PIPELINE RUN PROGRESS</span>
                      <span className="text-blue-600">{pipelineProgress}%</span>
                    </div>
                    <div className="w-full bg-slate-100 border border-slate-200 h-2.5 rounded-full overflow-hidden">
                      <motion.div
                        className="bg-gradient-to-r from-blue-600 via-indigo-500 to-purple-600 h-full rounded-full"
                        initial={{ width: 0 }}
                        animate={{ width: `${pipelineProgress}%` }}
                        transition={{ ease: "easeInOut" }}
                      />
                    </div>
                  </div>

                  {/* Side by side consoles */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 flex-1 my-2">
                    {/* Pipeline A empirical */}
                    <div className="bg-slate-950 border border-slate-900 p-3 rounded-xl flex flex-col justify-between h-[180px]">
                      <div className="flex items-center justify-between border-b border-slate-900 pb-1.5 mb-1.5">
                        <span className="text-[9px] font-bold text-slate-400 font-mono uppercase">PIPE A: EMPIRICAL TESTING VALIDATION</span>
                        {pipelineProgress > 0 && pipelineProgress < 100 && (
                          <RefreshCw className="w-3 h-3 text-blue-400 animate-spin" />
                        )}
                      </div>
                      <div className="flex-1 overflow-y-auto font-mono text-[9px] text-slate-400 space-y-1 pr-1">
                        {pipeALogs.length === 0 ? (
                          <span className="text-slate-650">Waiting for repair execution...</span>
                        ) : (
                          pipeALogs.map((l, i) => <div key={i}>{l}</div>)
                        )}
                        <div ref={pipeAEndRef} />
                      </div>
                    </div>

                    {/* Pipeline B formal */}
                    <div className="bg-slate-950 border border-slate-900 p-3 rounded-xl flex flex-col justify-between h-[180px]">
                      <div className="flex items-center justify-between border-b border-slate-900 pb-1.5 mb-1.5">
                        <span className="text-[9px] font-bold text-slate-400 font-mono uppercase">PIPE B: FORMAL SATISFIABILITY PROVER</span>
                        {pipelineProgress > 0 && pipelineProgress < 100 && (
                          <RefreshCw className="w-3 h-3 text-purple-400 animate-spin" />
                        )}
                      </div>
                      <div className="flex-1 overflow-y-auto font-mono text-[9px] text-slate-400 space-y-1 pr-1">
                        {pipeBLogs.length === 0 ? (
                          <span className="text-slate-650">Waiting for repair execution...</span>
                        ) : (
                          pipeBLogs.map((l, i) => <div key={i}>{l}</div>)
                        )}
                        <div ref={pipeBEndRef} />
                      </div>
                    </div>
                  </div>

                  {/* Accuracy indicators */}
                  <div className="grid grid-cols-5 gap-2 border-t border-slate-150 pt-3 text-center">
                    {[
                      { label: "Accuracy", val: `${verificationMetrics.accuracy}%` },
                      { label: "Precision", val: `${verificationMetrics.precision}%` },
                      { label: "Recall", val: `${verificationMetrics.recall}%` },
                      { label: "F1 Score", val: `${verificationMetrics.f1}%` },
                      { label: "Latency", val: `${verificationMetrics.latency}ms` },
                    ].map((m, idx) => (
                      <div key={idx} className="bg-slate-50 border border-slate-150 rounded-lg p-1.5">
                        <div className="text-[8px] text-slate-450 font-mono uppercase font-bold">{m.label}</div>
                        <div className="text-xs font-bold text-slate-800 font-mono mt-0.5">{m.val}</div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Hot Patch Deployer (Right: 4 cols) */}
                <div className="lg:col-span-4 bg-white border border-slate-200 shadow-sm rounded-2xl p-5 flex flex-col justify-between min-h-[380px]">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <div className="flex items-center gap-2">
                      <Zap className="w-4 h-4 text-blue-600 animate-pulse" />
                      <h2 className="text-sm font-bold text-slate-900">Hot Patch Deployer</h2>
                    </div>
                  </div>

                  {/* Deployment log terminal console */}
                  <div className="bg-slate-950 border border-slate-900 rounded-xl p-3.5 h-[160px] my-3 overflow-y-auto font-mono text-[10px] text-slate-400 space-y-1.5">
                    {deployLogs.length === 0 ? (
                      <div className="text-slate-655 flex flex-col items-center justify-center h-full text-center">
                        <Server className="w-8 h-8 text-slate-800 mb-2" />
                        <span>No hot patch staged.</span>
                      </div>
                    ) : (
                      deployLogs.map((l, i) => (
                        <div key={i} className="flex gap-1.5 items-start">
                          <span className="text-blue-500">▶</span>
                          <span>{l}</span>
                        </div>
                      ))
                    )}
                  </div>

                  {/* Deployment Info Box */}
                  <div className="text-xs bg-slate-50 border border-slate-150 rounded-xl p-3 space-y-1.5">
                    <div className="flex justify-between">
                      <span className="text-slate-500 font-mono text-[9px] font-bold">STAGED VERSION:</span>
                      <span className="font-bold text-blue-600 font-mono">v4.2.2-hotpatch</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500 font-mono text-[9px] font-bold">DOWNTIME PROJ:</span>
                      <span className="text-emerald-600 font-bold font-mono">0.00ms (ZERO)</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500 font-mono text-[9px] font-bold">SOLVER STATUS:</span>
                      <span
                        className={`font-bold font-mono ${
                          verificationBadge === "safe" || verificationBadge === "authorized"
                            ? "text-emerald-600"
                            : "text-amber-500"
                        }`}
                      >
                        {verificationBadge !== "idle" ? verificationBadge.toUpperCase() : "PENDING"}
                      </span>
                    </div>
                  </div>

                  {/* Trigger Button */}
                  <button
                    onClick={handleDeployPatch}
                    disabled={repairStatus !== "completed" || verificationBadge === "counterexample" || deployStatus === "deploying"}
                    className={`w-full mt-3 flex items-center justify-center gap-2 py-3 px-4 font-bold text-xs rounded-xl border transition shadow-sm ${
                      repairStatus === "completed" && verificationBadge !== "counterexample" && deployStatus !== "deploying"
                        ? "bg-emerald-600 border-emerald-500 text-white hover:bg-emerald-700 shadow-emerald-500/10 cursor-pointer"
                        : "bg-slate-100 border-slate-200 text-slate-400 cursor-not-allowed shadow-none"
                    }`}
                  >
                    {deployStatus === "deploying" ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        INSTALLING HOT PATCH...
                      </>
                    ) : deployStatus === "deployed" ? (
                      <>
                        <Check className="w-4 h-4 text-white" />
                        PATCH DEPLOYED SUCCESSFULLY
                      </>
                    ) : (
                      <>
                        <Zap className="w-4 h-4" />
                        DEPLOY HOT PATCH
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}

            {activeTab === "history" && (
              <div className="bg-white border border-slate-200 shadow-sm rounded-2xl p-5 space-y-6">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-slate-700" />
                    <h2 className="text-sm font-bold text-slate-900">Deployment Hot Patch Audit Timeline</h2>
                  </div>
                  <span className="text-[11px] font-mono text-slate-550 font-semibold bg-slate-50 border border-slate-150 px-2 py-0.5 rounded">
                    SYSTEM AUDIT HISTORY
                  </span>
                </div>

                {/* Timeline display */}
                <div className="space-y-4">
                  {timeline.map((item, idx) => (
                    <div key={item.id} className="relative flex gap-4 text-xs font-mono group">
                      
                      {/* Left icon circle line */}
                      <div className="flex flex-col items-center">
                        <div className="w-3.5 h-3.5 rounded-full border border-blue-500 bg-white flex items-center justify-center">
                          <div className="w-1.5 h-1.5 rounded-full bg-blue-600" />
                        </div>
                        {idx < timeline.length - 1 && (
                          <div className="w-px flex-1 bg-slate-200 group-hover:bg-slate-350 transition" />
                        )}
                      </div>

                      {/* Timeline Detail Card */}
                      <div className="flex-1 bg-slate-50 border border-slate-200 rounded-xl p-4 grid grid-cols-1 md:grid-cols-6 gap-3 items-center hover:border-slate-300 transition">
                        <div>
                          <div className="text-[9px] text-slate-450 font-bold uppercase">Timestamp</div>
                          <div className="text-slate-800 mt-1 font-semibold text-[11px]">{item.timestamp}</div>
                        </div>
                        <div>
                          <div className="text-[9px] text-slate-450 font-bold uppercase">Version ID</div>
                          <div className="text-blue-600 mt-1 font-bold font-mono">{item.version}</div>
                        </div>
                        <div>
                          <div className="text-[9px] text-slate-450 font-bold uppercase">Failure Mode</div>
                          <div className="text-slate-800 mt-1 font-semibold">{item.failureType}</div>
                        </div>
                        <div>
                          <div className="text-[9px] text-slate-455 font-bold uppercase">Strategy Selected</div>
                          <div className="text-slate-850 mt-1 font-semibold">{item.strategy}</div>
                        </div>
                        <div>
                          <div className="text-[9px] text-slate-450 font-bold uppercase">Validation Outcome</div>
                          <div className="text-emerald-700 mt-1 font-semibold">{item.validationResult}</div>
                        </div>
                        <div>
                          <div className="text-[9px] text-slate-450 font-bold uppercase">Authorized By</div>
                          <div className="text-slate-600 mt-1 flex items-center gap-1.5">
                            <User className="w-3.5 h-3.5 text-slate-400" />
                            {item.operator}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>
        </main>
      </div>

      {/* FOOTER SECTION */}
      <footer className="border-t border-slate-200 bg-white py-5 px-6 text-center text-xs text-slate-500 font-mono flex flex-col sm:flex-row items-center justify-between gap-4 z-10 shadow-inner">
        <div>
          © 2026 UniRepairNet Project. Distributed for Academic Demonstration and Review.
        </div>
        <div className="flex items-center gap-4 text-[10px] text-slate-400">
          <span>IEEE Trans. MLOps #412093</span>
          <span className="hidden sm:inline">|</span>
          <span>Open-Source (MIT License)</span>
        </div>
      </footer>
    </div>
  );
}
