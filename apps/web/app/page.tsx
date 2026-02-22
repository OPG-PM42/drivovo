import App from '@/ui/components/App';

export default function Home(): React.ReactElement {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <h1 className="text-4xl font-bold">Drivovo</h1>
      <App />
    </main>
  );
}
