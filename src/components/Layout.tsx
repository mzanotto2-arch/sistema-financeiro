import Menu from "./Menu";

type LayoutProps = {
  children: React.ReactNode;
};

export default function Layout({ children }: LayoutProps) {
  return (
    <div
      style={{
        display: "flex",
        minHeight: "100vh",
        background: "#f4f6f9",
      }}
    >
      <Menu />

      <div
        style={{
          flex: 1,
          padding: 30,
        }}
      >
        {children}
      </div>
    </div>
  );
}