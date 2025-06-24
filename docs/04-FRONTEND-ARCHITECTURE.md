# 🎨 Frontend Architecture - Insomnia Video Editor

**Generated:** December 21, 2024  
**Framework:** React 18.3.3 + TypeScript 5.8.3  
**Build Tool:** Vite 6.3.5  
**Status:** Production Ready  

---

## 📋 **EXECUTIVE SUMMARY**

The Insomnia Video Editor frontend is a sophisticated React application built with TypeScript, featuring a modern component architecture, advanced state management, and specialized video editing interfaces. The application combines traditional timeline editing with innovative node-based workflows.

### **Key Architectural Features**
- **Component-Based Architecture**: Modular, reusable React components
- **TypeScript Integration**: Full type safety across the application
- **Multi-View Interface**: Story Web (nodes) + Timeline Editor dual views
- **Real-time State Management**: Zustand + React Context for complex state
- **Canvas-Based Editing**: ReactFlow for node manipulation, custom timeline canvas

---

## 🏗️ **APPLICATION STRUCTURE**

### **Directory Organization**
```
src/
├── main.tsx                    # Application entry point
├── App.tsx                     # Main application container
├── StartingPage.tsx           # Landing page component
├── Sidebar.tsx                # Main sidebar with panels
├── CustomSceneNode.tsx        # Scene node component
├── CustomEdge.tsx             # Connection edge component
├── components/                # Reusable UI components
│   ├── AIAgentNode.tsx        # AI agent node component
│   ├── NodeTimeline.tsx       # Timeline editor modal
│   ├── InteractiveSceneModal.tsx
│   ├── SceneSearchAndFilter.tsx
│   ├── AIAgentsPanel.tsx
│   ├── AISidePanel.tsx
│   ├── SubtitleOverlay.tsx
│   └── ui/                    # Base UI components (Radix UI)
├── features/                  # Feature-specific modules
│   └── editor/               # Timeline editor feature
│       ├── editor.tsx        # Main editor component
│       ├── timeline/         # Timeline components
│       ├── scene/           # Scene rendering
│       ├── store/           # Editor state management
│       └── hooks/           # Editor-specific hooks
├── services/                 # Business logic services
│   ├── aiProcessingManager.ts
│   ├── subtitleGenerator.ts
│   ├── geminiService.ts
│   ├── audioTranslationService.ts
│   ├── storageOrchestrator.ts
│   └── cloudStorageManager.ts
├── utils/                   # Utility functions
│   ├── projectDataManager.ts
│   ├── timelineDataManager.ts
│   ├── compatibilityLayer.ts
│   └── debugCurrentData.ts
├── hooks/                   # Custom React hooks
│   └── useStoryboardElements.ts
└── types/                   # TypeScript type definitions
    └── index.ts
```

---

## 🎯 **CORE COMPONENTS**

### **1. Application Container (`App.tsx`)**

**Responsibilities:**
- Main application state management
- View switching (Story Web ↔ Timeline)
- Node and edge management for ReactFlow
- AI processing orchestration
- Data persistence coordination

**Key Features:**
```typescript
interface AppState {
  // View management
  currentView: 'story' | 'timeline';
  isSidebarVisible: boolean;
  
  // ReactFlow state
  nodes: Node<CustomNodeData>[];
  edges: Edge<CustomEdgeData>[];
  
  // Video analysis data
  currentAnalysisData: AnalyzedVideoData | null;
  
  // AI processing
  geminiApiConnected: boolean;
  apiHealthy: boolean;
}
```

**State Management Pattern:**
```typescript
// Centralized state updates
const handleNodeUpdate = useCallback((nodeId: string, updates: Partial<CustomNodeData>) => {
  setNodes(prevNodes => 
    prevNodes.map(node => 
      node.id === nodeId 
        ? { ...node, data: { ...node.data, ...updates } }
        : node
    )
  );
}, []);
```

### **2. Sidebar Component (`Sidebar.tsx`)**

**Panel System:**
```typescript
type PanelKey = 'storyWeb' | 'sceneBlocks' | 'video' | 'sceneList' | 
               'metadataEditor' | 'controls' | 'settings' | 'search' | 
               'aiAgents' | 'aiChat';

interface SidebarProps {
  activePanelKey: PanelKey;
  onTogglePanel: (key: PanelKey) => void;
  // ... other props
}
```

**Dynamic Panel Loading:**
- **Video Upload Panel**: File upload and analysis initiation
- **Scene List Panel**: Hierarchical scene management
- **AI Agents Panel**: Agent creation and management
- **Search Panel**: Fuzzy search across scenes and metadata
- **Metadata Editor**: Scene property editing

### **3. Node System Architecture**

#### **Scene Nodes (`CustomSceneNode.tsx`)**
```typescript
interface CustomNodeData {
  label: string;
  content: string;
  type: 'scene' | 'note' | 'entry' | 'intro' | 'outro' | 'ai-agent';
  videoAnalysisData?: NodeVideoSceneData;
  aiAgentData?: AIAgentNodeData;
  onDeleteNode?: (id: string) => void;
  onTitleChange?: (id: string, newTitle: string) => void;
  makeSceneMetadataUpdateRequest?: (
    nodeId: string,
    analysisId: string,
    sceneId: string,
    updates: { title?: string; tags?: string[] }
  ) => Promise<void>;
}
```

**Node Features:**
- **Inline Editing**: Double-click title editing with auto-save
- **AI Results Display**: Visual indicators for processed AI results
- **Connection Handles**: Input/output handles for ReactFlow connections
- **Status Indicators**: Processing status, errors, pending changes

#### **AI Agent Nodes (`AIAgentNode.tsx`)**
```typescript
interface AIAgentNodeData {
  agentId: string;
  agentType: AIAgentType;
  agentName: string;
  status: 'idle' | 'processing' | 'completed' | 'error';
  processingProgress?: number;
  inputConnections: string[];
  lastProcessedAt?: number;
  processingResults?: any;
}
```

**Agent Configuration:**
```typescript
const AI_AGENT_CONFIG = {
  'subtitle-generator': { icon: '📝', color: '#4CAF50', name: 'Subtitle Generator' },
  'video-enhancer': { icon: '✨', color: '#2196F3', name: 'Video Enhancer' },
  'audio-processor': { icon: '🎵', color: '#FF9800', name: 'Audio Processor' },
  'content-analyzer': { icon: '🔍', color: '#9C27B0', name: 'Content Analyzer' },
  'color-grader': { icon: '🎨', color: '#E91E63', name: 'Color Grader' },
  'object-detector': { icon: '👁️', color: '#607D8B', name: 'Object Detector' },
  'auto-editor': { icon: '✂️', color: '#795548', name: 'Auto Editor' },
  'scene-classifier': { icon: '🏷️', color: '#3F51B5', name: 'Scene Classifier' },
  'audio-translator': { icon: '🌐', color: '#FF6B35', name: 'Audio Translator' },
  'transition-suggester': { icon: '🔄', color: '#00BCD4', name: 'Transition Suggester' },
  'noise-reducer': { icon: '🔇', color: '#8BC34A', name: 'Noise Reducer' }
};
```

---

## 🎬 **TIMELINE ARCHITECTURE**

### **Dual Timeline System**

#### **1. Node Timeline (`NodeTimeline.tsx`)**
- **Purpose**: Scene-specific editing within modal interface
- **Features**: Trimming, audio adjustment, text overlays, effects
- **Canvas-based**: Custom canvas rendering for precise control
- **Integration**: Saves edits back to scene node data

**Timeline State Management:**
```typescript
interface NodeTimelineState {
  playhead: number;
  isPlaying: boolean;
  zoomLevel: number;
  selectedClips: string[];
  edits: SceneEdits;
  currentTool: 'selection' | 'blade' | 'hand' | 'zoom';
  clips: Clip[];
  isDragging: boolean;
  dragType: 'move' | 'trim-start' | 'trim-end' | 'playhead' | null;
}
```

#### **2. Main Timeline (`features/editor/timeline/timeline.tsx`)**
- **Purpose**: Professional multi-track timeline editing
- **Framework**: @designcombo/timeline package
- **Features**: Multi-track editing, advanced effects, export capabilities
- **Integration**: Separate from node system, full project timeline

**Timeline Components:**
```typescript
// Timeline component registration
CanvasTimeline.registerItems({
  Text,      // Text overlays
  Image,     // Image elements
  Audio,     // Audio tracks
  Video,     // Video tracks
  Caption,   // Subtitle tracks
  Helper,    // Helper elements
  Track,     // Track containers
  PreviewTrackItem  // Drag preview
});
```

---

## 🔄 **STATE MANAGEMENT**

### **Multi-Layer State Architecture**

#### **1. Application State (React State + Context)**
```typescript
// Main app state in App.tsx
const [nodes, setNodes, onNodesChange] = useNodesState([]);
const [edges, setEdges, onEdgesChange] = useEdgesState([]);
const [currentAnalysisData, setCurrentAnalysisData] = useState<AnalyzedVideoData | null>(null);
```

#### **2. Timeline Editor State (Zustand)**
```typescript
// features/editor/store/use-store.ts
interface ITimelineStore {
  duration: number;
  fps: number;
  scale: ITimelineScaleState;
  scroll: ITimelineScrollState;
  tracks: ITrack[];
  trackItemsMap: Record<string, ITrackItem>;
  activeIds: string[];
  timeline: Timeline | null;
  playerRef: React.RefObject<PlayerRef> | null;
}
```

#### **3. Persistent State (Storage Services)**
```typescript
// Project data persistence
const projectDataManager = {
  saveProject: (project: OptimizedProjectData) => Promise<void>;
  loadProject: () => Promise<OptimizedProjectData | null>;
  updateScene: (sceneId: string, updates: Partial<OptimizedSceneData>) => Promise<void>;
};
```

### **State Synchronization Challenges**
⚠️ **Known Issue**: Multiple state systems don't communicate properly:
- ReactFlow nodes state
- Timeline editor state  
- Persistent storage state
- AI processing results state

---

## 🎨 **UI COMPONENT SYSTEM**

### **Design System Foundation**
- **Base Components**: Radix UI primitives
- **Styling**: Tailwind CSS with custom design tokens
- **Theme**: Dark theme with purple accent colors
- **Typography**: Geist font family

### **Component Hierarchy**
```typescript
// Base UI Components (src/components/ui/)
Button, Dialog, DropdownMenu, Progress, ScrollArea, Label, Popover

// Application Components (src/components/)
AIAgentNode, NodeTimeline, InteractiveSceneModal, SubtitleOverlay

// Feature Components (src/features/editor/)
Timeline, Scene, Navbar, MenuList, MenuItem, ControlItem
```

### **Styling Patterns**
```css
/* Consistent component styling */
.story-node {
  @apply bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700;
  @apply rounded-lg shadow-sm hover:shadow-md transition-shadow;
}

.ai-agent-node {
  @apply bg-gradient-to-br from-purple-50 to-purple-100;
  @apply dark:from-purple-900 dark:to-purple-800;
  @apply border-2 border-purple-200 dark:border-purple-600;
}
```

---

## 🔌 **SERVICE INTEGRATION**

### **AI Processing Integration**
```typescript
// AI Processing Manager integration
const handleAddAIAgent = useCallback(async (
  agentType: AIAgentType,
  position: { x: number; y: number },
  connectedSceneIds?: string[]
) => {
  const agentId = `ai-agent-${Date.now()}`;
  
  // Create AI agent node
  const newNode = createAIAgentNode(agentId, agentType, position);
  setNodes(prev => [...prev, newNode]);
  
  // Process connected scenes if any
  if (connectedSceneIds?.length) {
    await aiProcessingManager.processMultipleScenes(
      connectedSceneIds,
      agentType,
      agentId
    );
  }
}, []);
```

### **Storage Service Integration**
```typescript
// Storage orchestrator integration
const saveProjectData = useCallback(async () => {
  const projectData = {
    nodes: nodes.map(node => ({
      id: node.id,
      type: node.type,
      position: node.position,
      data: node.data
    })),
    edges,
    viewport: reactFlowInstance?.getViewport(),
    analysisData: currentAnalysisData
  };
  
  await storageOrchestrator.saveProjectData(projectData);
}, [nodes, edges, currentAnalysisData]);
```

---

## 📱 **RESPONSIVE DESIGN**

### **Breakpoint Strategy**
```css
/* Tailwind breakpoints */
sm: 640px   /* Small tablets */
md: 768px   /* Tablets */
lg: 1024px  /* Small desktops */
xl: 1280px  /* Large desktops */
2xl: 1536px /* Extra large screens */
```

### **Responsive Components**
- **Sidebar**: Collapsible on mobile, full-width panels
- **Timeline**: Horizontal scrolling on small screens
- **Node Canvas**: Touch-friendly interactions on tablets
- **Modals**: Full-screen on mobile, centered on desktop

---

## ⚡ **PERFORMANCE OPTIMIZATIONS**

### **React Optimizations**
```typescript
// Memoized components
const CustomSceneNode = memo(SceneNodeComponent);
const AIAgentNode = memo(AIAgentNodeComponent);

// Optimized callbacks
const handleNodeUpdate = useCallback((nodeId: string, updates: any) => {
  // Update logic
}, []);

// Virtualized lists for large datasets
const SceneList = ({ scenes }: { scenes: AnalyzedScene[] }) => {
  return (
    <VirtualizedList
      items={scenes}
      renderItem={({ item }) => <SceneListItem scene={item} />}
      height={400}
    />
  );
};
```

### **Bundle Optimization**
```typescript
// vite.config.ts - Code splitting
build: {
  rollupOptions: {
    output: {
      manualChunks: {
        vendor: ['react', 'react-dom'],
        reactflow: ['reactflow'],
        ui: ['@radix-ui/react-dialog', '@radix-ui/react-dropdown-menu'],
        remotion: ['@remotion/player', '@remotion/media-utils']
      }
    }
  }
}
```

---

## 🔧 **DEVELOPMENT TOOLS**

### **Build Configuration**
- **Vite**: Fast development server and optimized builds
- **TypeScript**: Strict type checking with path aliases
- **ESLint**: Code quality and consistency
- **Prettier**: Code formatting

### **Development Scripts**
```json
{
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview",
    "lint": "eslint . --ext ts,tsx --report-unused-disable-directives --max-warnings 0"
  }
}
```

---

## 🚨 **KNOWN ISSUES & TECHNICAL DEBT**

### **Critical Issues**
1. **State Synchronization**: Multiple state systems don't communicate
2. **Memory Leaks**: Large video files not properly garbage collected
3. **Timeline Integration**: Node timeline and main timeline not synchronized

### **Performance Issues**
1. **Large Node Graphs**: Performance degrades with 100+ nodes
2. **Video Playback**: Stuttering on lower-end devices
3. **Storage Quota**: No proper quota management for browser storage

### **UI/UX Issues**
1. **Mobile Experience**: Limited mobile optimization
2. **Accessibility**: Missing ARIA labels and keyboard navigation
3. **Error Handling**: Inconsistent error display patterns

---

## 📚 **RELATED DOCUMENTATION**

- [System Architecture](./01-SYSTEM-ARCHITECTURE.md)
- [Backend Architecture](./05-BACKEND-ARCHITECTURE.md)
- [Node Timeline System](./08-NODE-TIMELINE-SYSTEM.md)
- [Storage Systems](./06-STORAGE-SYSTEMS.md)
- [Code Quality Assessment](./10-CODE-QUALITY-ASSESSMENT.md)
