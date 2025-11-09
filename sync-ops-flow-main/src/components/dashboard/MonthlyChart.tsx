import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";

const data = [
  { month: "Jan", alimentacao: 4200, combustivel: 3800, materiais: 2400 },
  { month: "Fev", alimentacao: 3800, combustivel: 4200, materiais: 2800 },
  { month: "Mar", alimentacao: 4600, combustivel: 3900, materiais: 3200 },
  { month: "Abr", alimentacao: 4200, combustivel: 4100, materiais: 2900 },
  { month: "Mai", alimentacao: 4800, combustivel: 4300, materiais: 3400 },
  { month: "Jun", alimentacao: 4500, combustivel: 4000, materiais: 3100 },
];

export const MonthlyChart = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Gastos Mensais por Categoria</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis dataKey="month" className="text-xs" />
            <YAxis className="text-xs" />
            <Tooltip
              contentStyle={{
                backgroundColor: "hsl(var(--card))",
                border: "1px solid hsl(var(--border))",
                borderRadius: "8px",
              }}
            />
            <Legend />
            <Bar dataKey="alimentacao" name="Alimentação" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
            <Bar dataKey="combustivel" name="Combustível" fill="hsl(var(--accent))" radius={[4, 4, 0, 0]} />
            <Bar dataKey="materiais" name="Materiais" fill="hsl(var(--success))" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};
