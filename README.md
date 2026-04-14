# Bhej Mujhe (SendMe) - High-Speed P2P File Transfer

**Bhej Mujhe** is a state-of-the-art web application designed to transfer files of absolutely any size directly from one device to another at maximum network speeds. By utilizing pure WebRTC Data Channels, files never touch a centralized server, granting infinite file size caps, heightened privacy, and lightning-fast speeds.

## 🛠 Tech Stack

- **Framework**: [Next.js (App Router)](https://nextjs.org/) & React
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/) (Custom Dark Mode Aesthetics & Glassmorphism)
- **Animations**: [Framer Motion](https://www.framer.com/motion/) (Dynamic SVG Rendering & Pop Animations)
- **P2P Networking**: [PeerJS](https://peerjs.com/) (WebRTC Abstraction Layer)
- **Deployment & Analytics**: [Vercel](https://vercel.com/) + `@vercel/analytics`
- **Icons**: [Lucide React](https://lucide.dev/)

## 🧠 Core Technical Architecture

### 1. Peer-to-Peer Data Channels (WebRTC)
Instead of standard HTTP requests where a file is uploaded to an AWS S3 bucket and then downloaded by the receiver, Bhej Mujhe establishes a direct `RTCDataChannel` UDP tunnel between the two browsers. The transfer bandwidth is solely limited by the Sender's upload speed and the Receiver's download speed.

### 2. Deep ICE Candidate & STUN Routing
WebRTC usually struggles to connect over cellular hotspots or aggressive corporate Wi-Fi architectures due to complex NAT layers (Symmetric NAT). To force connection reliability (Hole Punching), the initialization logic aggressively relies on an array of `stun.l.google.com:19302` Google STUN servers to expose public IP endpoints seamlessly. 

### 3. Fast File Slicing (Memory Management)
Browsers typically crash with "Out of Memory" errors if you try to load a 10GB 4K Video directly into RAM. To avoid this:
- The application utilizes native JavaScript `FileReader`.
- We read the file in strict **256KB Chunks** (`ArrayBuffer`).
- The chunk is sequentially sent through the WebRTC data tunnel.
- The Receiver buffers these chunk arrays and finally reconstructs a single `Blob` URL locally to trigger a direct-to-disk download.

### 4. OTP-Namespace Abstraction
To make sharing seamless, the app creates rapid 6-Digit Codes instead of terrifying 16-character UUIDs. Because public PeerJS signaling servers (`0.peerjs.com`) handle thousands of users worldwide, 6-digit codes risk hijacking/collision. Bhej Mujhe encrypts your 6 digit code internally behind a unique namespace prefix (e.g., `<namespace>_192837`) before hitting the signal server.

### 5. Custom Typography
The application boasts a hybrid typographical logo, marrying Devanagari (Hindi) and Latin characters seamlessly (`भेhej मुjhe`), visually connected by a digitally injected Shirorekha (the upper text border line characteristic of Hindi script).
