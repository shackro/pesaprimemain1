// frontend/src/pages/InvestmentsPage.tsx
import { useEffect, useState, type FormEvent, type ChangeEvent } from "react";
import { getInvestments, createInvestment as createInvestmentAPI, deleteInvestment as deleteInvestmentAPI } from "../services/api";

// Types for an investment item returned from API
interface Investment {
  id: number;
  user_id: string;
  title: string;
  amount: number;
  category?: string;
  created_at?: string;
}

// Form structure
interface InvestmentForm {
  user_id: string;
  title: string;
  amount: string; // keep as string for inputs
  category: string;
}

export default function InvestmentsPage() {
  const [investments, setInvestments] = useState<Investment[]>([]);
  const [form, setForm] = useState<InvestmentForm>({
    user_id: "",
    title: "",
    amount: "",
    category: "general",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchAll();
  }, []);

  const fetchAll = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getInvestments();
      setInvestments(data || []);
    } catch (err: any) {
      console.error("Error fetching investments:", err);
      setError(err?.message || "Failed to fetch investments");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    try {
      await createInvestmentAPI({
        ...form,
        amount: Number(form.amount),
      });
      setForm({ user_id: "", title: "", amount: "", category: "general" });
      fetchAll();
    } catch (err: any) {
      console.error("Error creating investment:", err);
      setError(err?.message || "Failed to create investment");
    }
  };

  const handleDelete = async (id: number) => {
    setError(null);
    try {
      await deleteInvestmentAPI(id);
      fetchAll();
    } catch (err: any) {
      console.error("Error deleting investment:", err);
      setError(err?.message || "Failed to delete investment");
    }
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value } as any);
  };

  return (
    <div style={{ padding: "20px" }}>
      <h2>Investments</h2>
      {error && <div style={{ color: "red", marginBottom: 12 }}>{error}</div>}
      <form onSubmit={handleSubmit} style={{ marginBottom: "20px" }}>
        <input type="text" name="user_id" placeholder="User ID or phone" value={form.user_id} onChange={handleChange} />
        <input type="text" name="title" placeholder="Investment Title" value={form.title} onChange={handleChange} />
        <input type="number" name="amount" placeholder="Amount" value={form.amount} onChange={handleChange} />
        <select name="category" value={form.category} onChange={handleChange}>
          <option value="general">General</option>
          <option value="long-term">Long term</option>
          <option value="short-term">Short term</option>
        </select>
        <button type="submit" disabled={loading}>Create Investment</button>
      </form>

      {loading ? (
        <div>Loading...</div>
      ) : (
        <ul>
          {investments.map((item) => (
            <li key={item.id} style={{ marginBottom: 8 }}>
              <strong>{item.title}</strong> — ${item.amount} {item.category ? `• ${item.category}` : null}
              <button onClick={() => handleDelete(item.id)} style={{ marginLeft: 10 }}>
                Delete
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
