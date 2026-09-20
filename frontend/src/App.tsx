import Navbar from "./components/layout/Navbar";
import Footer from "./components/layout/Footer";
import Hero from "./components/home/Hero";
import About from "./components/home/About";
import HowItWorks from "./components/home/HowItWorks";

function App() {
  return (
    <div className="min-h-screen bg-white text-slate-900">
      <Navbar />

      <main>
        <Hero />
        <About />
        <HowItWorks />
      </main>

      <Footer />
    </div>
  );
}

export default App;