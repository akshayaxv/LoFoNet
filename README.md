# MURSHID
> **The Intelligent Lost & Found System**

![System Architecture](public/banner.png)

## SYSTEM ARCHITECTURE & CAPABILITIES

**Murshid** is a next-generation **Smart Lost & Found System** engineered to automate the reconciliation of missing items. It resolves object displacement anomalies through high-dimensional vector matching and fuzzy logic, correlating lost item reports with found objects in real-time.

This platform is engineered for scalability, privacy, and precision, utilizing a serverless PostgreSQL infrastructure to ensure data integrity and high availability.

### CORE TECHNOLOGICAL PILLARS

*   **Heuristic Matching Engine**: Utilizes non-deterministic algorithms to compute confidence intervals between disparate datasets, factoring in geospatial coordinates, temporal metadata, and semantic category taxonomy.
*   **Geospatial Triangulation**: Integrated vector mapping interface for precise coordinate acquisition and radius-based efficient querying.
*   **Progressive Web Application (PWA)**: Offline-first capability with service worker caching strategies for uninterrupted operation in low-bandwidth environments.
*   **Reactive User Interface**: High-performance frontend utilizing React 18 concurrent features for optimal rendering and state management.

---

## LIVE DEPLOYMENT

The system is currently deployed and accessible for live demonstration. This deployment showcases the frontend capabilities and real-time interaction flows.

**[View Live System](https://murshid-sys.vercel.app)**

### DEFAULT ADMIN CREDENTIALS
To access the administrative dashboard, use the following seeded credentials (ensure you run the seed SQL below):
*   **Username**: `admin@murshid-sys.com`
*   **Password**: `Admin123!@#`

---

### 1. DISTRIBUTED SYSTEM TOPOLOGY
![System Architecture Diagram](public/system-architecture.svg)
> **Figure 1**: The system operates on a **decoupled serverless topology**, orchestrating high-throughput interactions between the React-based Progressive Web Application (PWA) and a scalable Node.js event runtime. Data persistence is managed via an auto-scaling PostgreSQL cluster, ensuring ACID compliance for transactional integrity while maintaining low-latency state synchronization.

### 2. HEURISTIC MATCHING PIPELINE
![Data Flow Diagram](public/VF_ASSET_FLOW_1765801988624.svg)
> **Figure 2**: The **Cognitive Reconciliation Pipeline** implements a non-deterministic fuzzy matching algorithm. It ingests multidimensional feature vectors (keywords, time-deltas, location hashes) from disparate 'Lost' and 'Found' datasets, converging them through a weighted scoring engine to identify probable entity alignments with a high confidence coefficient.

### 3. GEOSPATIAL INTELLIGENCE GRID
![Geo-Spatial Concept](public/geo-spatial.svg)
> **Figure 3**: **Spatial Intelligence Integration**. Utilizing a geospatial index, the system performs radius-based proximity filtering. This enables the platform to normalize location data into queryable vector coordinates, allowing for precise hyper-local retrieval zones and optimized spatial querying.

---

## TECHNICAL STACK

*   **Runtime Environment**: React 18, TypeScript 5 (Strict Mode)
*   **State Management**: React Context API + Custom Hooks
*   **Styling Engine**: Tailwind CSS (Utility-First) + Shadcn UI (Component Primitives)
*   **Build Pipeline**: Vite (ESBuild)
*   **Persistence Layer**: PostgreSQL (Neon Serverless)
*   **Object Storage**: ImgBB API (CDN Distribution)

---

## LOCAL DEVELOPMENT PROTOCOL

### PREREQUISITES

*   **Node.js Runtime**: v18.x or higher
*   **Package Manager**: NPM v9.x or higher
*   **Database**: PostgreSQL connection string (Neon.tech recommended)

### INITIALIZATION

1.  **Repository Cloning**
    ```bash
    git clone https://github.com/itsTrack/murshid.git
    cd murshid
    ```

2.  **Dependency Resolution**
    ```bash
    npm install
    ```

3.  **Environment Configuration**
    Create a `.env` file in the root directory:
    ```env
    VITE_NEON_DATABASE_URL=postgresql://user:pass@host/db
    VITE_IMGBB_API_KEY=your_api_key
    ```

4.  **Database Migration & Seeding**
    Execute the DDL statements located in `database/schema.sql` to initialize the relational schema.
    
   
5.  **Process Execution**
    ```bash
    npm run dev
    ```

---

## LICENSE

MIT License.
