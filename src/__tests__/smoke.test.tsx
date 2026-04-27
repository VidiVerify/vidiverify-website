import { describe, it, expect, vi } from "vitest";
import { render } from "@testing-library/react";

// Mock WebGL and Three.js since jsdom doesn't support them
vi.mock("@react-three/fiber", () => ({
   Canvas: ({ children }: { children: React.ReactNode }) => (
      <div data-testid="canvas">{children}</div>
   ),
   useFrame: vi.fn(),
}));

vi.mock("@react-three/drei", () => ({
   Float: ({ children }: { children: React.ReactNode }) => (
      <div>{children}</div>
   ),
   MeshDistortMaterial: () => null,
   PerformanceMonitor: () => null,
}));

vi.mock("@tsparticles/react", () => ({
   default: () => <div data-testid="particles" />,
   initParticlesEngine: () => Promise.resolve(),
}));

vi.mock("lenis", () => ({
   default: class {
      raf() {
         // no-op: test stub
      }
      destroy() {
         // no-op: test stub
      }
      scrollTo() {
         // no-op: test stub
      }
   },
}));

describe("App", () => {
   it("renders without crashing", async () => {
      const { default: App } = await import("../App");
      const { container } = render(<App />);
      expect(container.querySelector("main")).toBeTruthy();
   });
});

describe("Data layer", () => {
   it("required getters return data", async () => {
      const {
         getName,
         getRoles,
         getServices,
         getFormats,
         getContactOptions,
      } = await import("@data/dataLoader");
      expect(getName()).toBeTruthy();
      expect(getRoles().length).toBeGreaterThan(0);
      expect(getServices().length).toBeGreaterThan(0);
      expect(getFormats()).toBeTruthy();
      expect(getContactOptions().length).toBeGreaterThan(0);
   });
});
