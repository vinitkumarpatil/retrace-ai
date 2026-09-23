"use client";

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  checkHealth,
  getGlobalGraph,
  listDocuments,
  queryReconstruction,
  seedSampleData,
  streamReconstruction,
  type StreamStage,
} from "./api";
import {
  DocumentItem,
  EntityLink,
  EntityNode,
  Investigation,
  ReconstructionResult,
} from "./types";
import { makeId } from "./utils";

const STORAGE_KEY = "retrace.investigations.v1";
const MAX_STORED = 25;

interface RetraceContextValue {
  // documents
  documents: DocumentItem[];
  documentsLoading: boolean;
  refreshDocuments: () => Promise<void>;

  // global graph
  graphNodes: EntityNode[];
  graphLinks: EntityLink[];
  graphLoading: boolean;
  refreshGraph: () => Promise<void>;

  // investigations
  investigations: Investigation[];
  getInvestigation: (id: string) => Investigation | undefined;
  // Pass onStage to receive live SSE pipeline stages; falls back to POST /api/query.
  runInvestigation: (
    question: string,
    onStage?: (stage: StreamStage) => void
  ) => Promise<string>; // returns id
  removeInvestigation: (id: string) => void;
  clearInvestigations: () => void;

  // seed
  seedDemo: () => Promise<void>;
  seeding: boolean;

  // backend connectivity
  backendStatus: "checking" | "online" | "offline";
  refreshHealth: () => Promise<void>;

  // command palette
  paletteOpen: boolean;
  setPaletteOpen: (open: boolean) => void;

  // hydration flag (avoids SSR/client mismatch for persisted data)
  hydrated: boolean;
}

const RetraceContext = createContext<RetraceContextValue | null>(null);

export function RetraceProvider({ children }: { children: React.ReactNode }) {
  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [documentsLoading, setDocumentsLoading] = useState(false);

  const [graphNodes, setGraphNodes] = useState<EntityNode[]>([]);
  const [graphLinks, setGraphLinks] = useState<EntityLink[]>([]);
  const [graphLoading, setGraphLoading] = useState(false);

  const [investigations, setInvestigations] = useState<Investigation[]>([]);
  const [seeding, setSeeding] = useState(false);
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [hydrated, setHydrated] = useState(false);
  const [backendStatus, setBackendStatus] =
    useState<"checking" | "online" | "offline">("checking");

  const didInit = useRef(false);

  // Hydrate persisted investigations (client only).
  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as Investigation[];
        if (Array.isArray(parsed)) setInvestigations(parsed);
      }
    } catch {
      /* ignore corrupt storage */
    }
    setHydrated(true);
  }, []);

  // Persist investigations whenever they change (after hydration).
  useEffect(() => {
    if (!hydrated) return;
    try {
      window.localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(investigations.slice(0, MAX_STORED))
      );
    } catch {
      /* storage may be full/unavailable — non-fatal */
    }
  }, [investigations, hydrated]);

  const refreshDocuments = useCallback(async () => {
    setDocumentsLoading(true);
    try {
      const docs = await listDocuments();
      setDocuments(docs);
    } catch (e) {
      // Non-fatal: backend may be offline. Callers surface their own errors.
      console.warn("Could not fetch documents", e);
    } finally {
      setDocumentsLoading(false);
    }
  }, []);

  const refreshGraph = useCallback(async () => {
    setGraphLoading(true);
    try {
      const { nodes, links } = await getGlobalGraph();
      setGraphNodes(nodes);
      setGraphLinks(links);
    } catch (e) {
      console.warn("Could not fetch knowledge graph", e);
    } finally {
      setGraphLoading(false);
    }
  }, []);

  const refreshHealth = useCallback(async () => {
    try {
      await checkHealth();
      setBackendStatus("online");
    } catch {
      setBackendStatus("offline");
    }
  }, []);

  useEffect(() => {
    if (didInit.current) return;
    didInit.current = true;
    refreshHealth();
    const interval = setInterval(refreshHealth, 12000);
    return () => clearInterval(interval);
  }, [refreshHealth]);

  // Whenever the backend (re)connects, (re)load documents and the graph.
  // This recovers the common case where the app loaded before the backend was up.
  const prevStatus = useRef(backendStatus);
  useEffect(() => {
    if (backendStatus === "online" && prevStatus.current !== "online") {
      refreshDocuments();
      refreshGraph();
    }
    prevStatus.current = backendStatus;
  }, [backendStatus, refreshDocuments, refreshGraph]);

  const getInvestigation = useCallback(
    (id: string) => investigations.find((i) => i.id === id),
    [investigations]
  );

  const runInvestigation = useCallback(
    async (question: string, onStage?: (stage: StreamStage) => void): Promise<string> => {
    let result: ReconstructionResult;
    if (onStage) {
      try {
        result = await streamReconstruction(question, { onStage });
      } catch {
        // Streaming unavailable (e.g. proxy buffering) — fall back to plain POST.
        result = await queryReconstruction(question);
      }
    } else {
      result = await queryReconstruction(question);
    }
    const id = makeId();
    const investigation: Investigation = {
      id,
      question,
      result,
      createdAt: new Date().toISOString(),
    };
    setInvestigations((prev) => [investigation, ...prev].slice(0, MAX_STORED));
    return id;
  }, []);

  const removeInvestigation = useCallback((id: string) => {
    setInvestigations((prev) => prev.filter((i) => i.id !== id));
  }, []);

  const clearInvestigations = useCallback(() => setInvestigations([]), []);

  const seedDemo = useCallback(async () => {
    setSeeding(true);
    try {
      await seedSampleData();
      await Promise.all([refreshDocuments(), refreshGraph()]);
    } finally {
      setSeeding(false);
    }
  }, [refreshDocuments, refreshGraph]);

  const value = useMemo<RetraceContextValue>(
    () => ({
      documents,
      documentsLoading,
      refreshDocuments,
      graphNodes,
      graphLinks,
      graphLoading,
      refreshGraph,
      investigations,
      getInvestigation,
      runInvestigation,
      removeInvestigation,
      clearInvestigations,
      seedDemo,
      seeding,
      backendStatus,
      refreshHealth,
      paletteOpen,
      setPaletteOpen,
      hydrated,
    }),
    [
      documents,
      documentsLoading,
      refreshDocuments,
      graphNodes,
      graphLinks,
      graphLoading,
      refreshGraph,
      investigations,
      getInvestigation,
      runInvestigation,
      removeInvestigation,
      clearInvestigations,
      seedDemo,
      seeding,
      backendStatus,
      refreshHealth,
      paletteOpen,
      hydrated,
    ]
  );

  return <RetraceContext.Provider value={value}>{children}</RetraceContext.Provider>;
}

export function useRetrace(): RetraceContextValue {
  const ctx = useContext(RetraceContext);
  if (!ctx) throw new Error("useRetrace must be used within <RetraceProvider>");
  return ctx;
}
