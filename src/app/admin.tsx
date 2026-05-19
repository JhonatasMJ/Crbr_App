import { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  LogOut,
  Plus,
  Trash2,
  Target,
  TrendingUp,
  DollarSign,
  CheckCircle,
  Circle,
} from "lucide-react-native";

import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/auth.context";
import { useSnackBarContext } from "@/context/snackbar.context";

interface Expense {
  id: string;
  description: string;
  amount: number;
  category: string;
  date: string;
  completed: boolean;
}

interface FinancialGoal {
  id: string;
  title: string;
  targetAmount: number;
  currentAmount: number;
  deadline: string;
  category: string;
}

export default function AdminScreen() {
  const { logout } = useAuth();
  const { notify } = useSnackBarContext();
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [goals, setGoals] = useState<FinancialGoal[]>([]);
  const [newExpense, setNewExpense] = useState("");
  const [newExpenseAmount, setNewExpenseAmount] = useState("");
  const [newGoal, setNewGoal] = useState("");
  const [newGoalAmount, setNewGoalAmount] = useState("");
  const [activeTab, setActiveTab] = useState<"expenses" | "goals" | "dashboard">(
    "dashboard",
  );

  async function handleSignOut() {
    try {
      await logout();
    } catch {
      notify({
        message: "Erro ao fazer logout",
        messageType: "ERROR",
      });
    }
  }

  function addExpense() {
    if (!newExpense.trim() || !newExpenseAmount.trim()) {
      notify({
        message: "Preencha todos os campos",
        messageType: "ERROR",
      });
      return;
    }

    const amount = parseFloat(newExpenseAmount);
    if (Number.isNaN(amount) || amount <= 0) {
      notify({ message: "Valor inválido", messageType: "ERROR" });
      return;
    }

    const expense: Expense = {
      id: Date.now().toString(),
      description: newExpense,
      amount,
      category: "Geral",
      date: new Date().toISOString(),
      completed: false,
    };

    setExpenses([...expenses, expense]);
    setNewExpense("");
    setNewExpenseAmount("");
    notify({ message: "Gasto adicionado", messageType: "SUCCESS" });
  }

  function toggleExpense(id: string) {
    setExpenses(
      expenses.map((expense) =>
        expense.id === id ? { ...expense, completed: !expense.completed } : expense,
      ),
    );
  }

  function deleteExpense(id: string) {
    Alert.alert("Confirmar exclusão", "Tem certeza que deseja excluir este gasto?", [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Excluir",
        style: "destructive",
        onPress: () => {
          setExpenses(expenses.filter((expense) => expense.id !== id));
          notify({ message: "Gasto excluído", messageType: "SUCCESS" });
        },
      },
    ]);
  }

  function addGoal() {
    if (!newGoal.trim() || !newGoalAmount.trim()) {
      notify({
        message: "Preencha todos os campos",
        messageType: "ERROR",
      });
      return;
    }

    const amount = parseFloat(newGoalAmount);
    if (Number.isNaN(amount) || amount <= 0) {
      notify({ message: "Valor inválido", messageType: "ERROR" });
      return;
    }

    const goal: FinancialGoal = {
      id: Date.now().toString(),
      title: newGoal,
      targetAmount: amount,
      currentAmount: 0,
      deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      category: "Meta",
    };

    setGoals([...goals, goal]);
    setNewGoal("");
    setNewGoalAmount("");
    notify({ message: "Meta adicionada", messageType: "SUCCESS" });
  }

  function updateGoalProgress(id: string, amount: number) {
    setGoals(
      goals.map((goal) => {
        if (goal.id === id) {
          const newAmount = Math.min(goal.currentAmount + amount, goal.targetAmount);
          return { ...goal, currentAmount: newAmount };
        }
        return goal;
      }),
    );
  }

  const totalExpenses = expenses.reduce((sum, expense) => sum + expense.amount, 0);
  const completedExpenses = expenses.filter((expense) => expense.completed);
  const pendingExpenses = expenses.filter((expense) => !expense.completed);
  const currentGoals = goals.reduce((sum, goal) => sum + goal.currentAmount, 0);

  const renderDashboard = () => (
    <View className="gap-4">
      <View className="flex-row gap-3">
        <View className="flex-1 rounded-xl bg-red-600 p-4">
          <View className="flex-row items-center justify-between">
            <View>
              <Text className="text-sm text-white opacity-80">Total Gastos</Text>
              <Text className="text-xl font-bold text-white">
                R$ {totalExpenses.toFixed(2)}
              </Text>
            </View>
            <DollarSign size={24} color="white" />
          </View>
        </View>

        <View className="flex-1 rounded-xl bg-green-600 p-4">
          <View className="flex-row items-center justify-between">
            <View>
              <Text className="text-sm text-white opacity-80">Metas</Text>
              <Text className="text-xl font-bold text-white">
                R$ {currentGoals.toFixed(2)}
              </Text>
            </View>
            <Target size={24} color="white" />
          </View>
        </View>
      </View>

      <View className="flex-row gap-3">
        <View className="flex-1 rounded-xl bg-blue-600 p-4">
          <View className="flex-row items-center justify-between">
            <View>
              <Text className="text-sm text-white opacity-80">Pendentes</Text>
              <Text className="text-xl font-bold text-white">
                {pendingExpenses.length}
              </Text>
            </View>
            <Circle size={24} color="white" />
          </View>
        </View>

        <View className="flex-1 rounded-xl bg-purple-600 p-4">
          <View className="flex-row items-center justify-between">
            <View>
              <Text className="text-sm text-white opacity-80">Concluídas</Text>
              <Text className="text-xl font-bold text-white">
                {completedExpenses.length}
              </Text>
            </View>
            <CheckCircle size={24} color="white" />
          </View>
        </View>
      </View>
    </View>
  );

  const renderExpenses = () => (
    <View className="gap-4">
      <View className="rounded-xl border border-zinc-700 bg-zinc-800 p-4">
        <Text className="mb-3 text-lg font-bold text-white">Adicionar Gasto</Text>
        <TextInput
          placeholder="Descrição do gasto"
          placeholderTextColor="#9CA3AF"
          value={newExpense}
          onChangeText={setNewExpense}
          className="mb-4 rounded-lg bg-zinc-700 p-3 text-white"
        />
        <TextInput
          placeholder="Valor (R$)"
          placeholderTextColor="#9CA3AF"
          value={newExpenseAmount}
          onChangeText={setNewExpenseAmount}
          keyboardType="numeric"
          className="rounded-lg bg-zinc-700 p-3 text-white"
        />
        <TouchableOpacity
          onPress={addExpense}
          className="mt-4 flex-row items-center justify-center rounded-lg bg-primary p-3"
        >
          <Plus size={20} color="#111" />
          <Text className="ml-2 font-bold text-secondary">Adicionar</Text>
        </TouchableOpacity>
      </View>

      <Text className="text-lg font-bold text-white">Lista de Gastos</Text>
      {expenses.length === 0 ? (
        <View className="items-center rounded-xl border border-zinc-700 bg-zinc-800 p-6">
          <Text className="text-center text-zinc-400">Nenhum gasto registrado</Text>
        </View>
      ) : (
        expenses.map((expense) => (
          <View
            key={expense.id}
            className="flex-row items-center justify-between rounded-xl border border-zinc-700 bg-zinc-800 p-4"
          >
            <TouchableOpacity
              onPress={() => toggleExpense(expense.id)}
              className="flex-1 flex-row items-center"
            >
              {expense.completed ? (
                <CheckCircle size={24} color="#10B981" />
              ) : (
                <Circle size={24} color="#6B7280" />
              )}
              <View className="ml-3 flex-1">
                <Text
                  className={`text-white ${expense.completed ? "line-through opacity-60" : ""}`}
                >
                  {expense.description}
                </Text>
                <Text className="text-sm text-zinc-400">
                  R$ {expense.amount.toFixed(2)}
                </Text>
              </View>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => deleteExpense(expense.id)} className="ml-3">
              <Trash2 size={20} color="#EF4444" />
            </TouchableOpacity>
          </View>
        ))
      )}
    </View>
  );

  const renderGoals = () => (
    <View className="gap-4">
      <View className="rounded-xl border border-zinc-700 bg-zinc-800 p-4">
        <Text className="mb-3 text-lg font-bold text-white">Adicionar Meta</Text>
        <TextInput
          placeholder="Nome da meta"
          placeholderTextColor="#9CA3AF"
          value={newGoal}
          onChangeText={setNewGoal}
          className="mb-4 rounded-lg bg-zinc-700 p-3 text-white"
        />
        <TextInput
          placeholder="Valor objetivo (R$)"
          placeholderTextColor="#9CA3AF"
          value={newGoalAmount}
          onChangeText={setNewGoalAmount}
          keyboardType="numeric"
          className="rounded-lg bg-zinc-700 p-3 text-white"
        />
        <TouchableOpacity
          onPress={addGoal}
          className="mt-4 flex-row items-center justify-center rounded-lg bg-primary p-3"
        >
          <Target size={20} color="#111" />
          <Text className="ml-2 font-bold text-secondary">Adicionar Meta</Text>
        </TouchableOpacity>
      </View>

      <Text className="text-lg font-bold text-white">Metas Financeiras</Text>
      {goals.length === 0 ? (
        <View className="items-center rounded-xl border border-zinc-700 bg-zinc-800 p-6">
          <Text className="text-center text-zinc-400">Nenhuma meta definida</Text>
        </View>
      ) : (
        goals.map((goal) => {
          const progress = (goal.currentAmount / goal.targetAmount) * 100;
          return (
            <View
              key={goal.id}
              className="rounded-xl border border-zinc-700 bg-zinc-800 p-4"
            >
              <View className="mb-2 flex-row items-center justify-between">
                <Text className="font-bold text-white">{goal.title}</Text>
                <Text className="font-bold text-green-400">
                  R$ {goal.currentAmount.toFixed(2)} / R${" "}
                  {goal.targetAmount.toFixed(2)}
                </Text>
              </View>

              <View className="mb-3 h-2 rounded-full bg-zinc-700">
                <View
                  className="h-2 rounded-full bg-green-500"
                  style={{ width: `${Math.min(progress, 100)}%` }}
                />
              </View>

              <View className="flex-row gap-2">
                <TouchableOpacity
                  onPress={() => updateGoalProgress(goal.id, 100)}
                  className="flex-1 rounded-lg bg-green-600 p-2"
                >
                  <Text className="text-center font-bold text-white">+R$ 100</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => updateGoalProgress(goal.id, 500)}
                  className="flex-1 rounded-lg bg-blue-600 p-2"
                >
                  <Text className="text-center font-bold text-white">+R$ 500</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => updateGoalProgress(goal.id, 1000)}
                  className="flex-1 rounded-lg bg-purple-600 p-2"
                >
                  <Text className="text-center font-bold text-white">+R$ 1000</Text>
                </TouchableOpacity>
              </View>
            </View>
          );
        })
      )}
    </View>
  );

  return (
    <SafeAreaView className="flex-1 bg-background">
      <ScrollView showsVerticalScrollIndicator={false} className="flex-1 px-4">
        <View className="mb-4 mt-4 items-center">
          <View className="mb-4 h-20 w-20 items-center justify-center rounded-full bg-zinc-800">
            <TrendingUp size={40} color="#eab308" />
          </View>
          <Text className="text-2xl font-bold text-white">Painel Admin</Text>
          <Text className="mt-1 text-center text-zinc-400">
            Gerencie gastos e metas internas
          </Text>
        </View>

        <View className="mb-6 flex-row rounded-xl bg-zinc-800 p-1">
          {(["dashboard", "expenses", "goals"] as const).map((tab) => (
            <TouchableOpacity
              key={tab}
              onPress={() => setActiveTab(tab)}
              className={`flex-1 rounded-lg px-4 py-3 ${activeTab === tab ? "bg-primary" : ""}`}
            >
              <Text
                className={`text-center font-bold ${activeTab === tab ? "text-secondary" : "text-zinc-400"}`}
              >
                {tab === "dashboard" ? "Dashboard" : tab === "expenses" ? "Gastos" : "Metas"}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {activeTab === "dashboard" && renderDashboard()}
        {activeTab === "expenses" && renderExpenses()}
        {activeTab === "goals" && renderGoals()}

        <View className="mb-16 mt-12">
          <Button className="bg-secondary" size="xl" onPress={handleSignOut}>
            <View className="flex-row items-center gap-2">
              <LogOut size={20} color="#fff" />
              <Text className="text-lg font-bold text-white">Sair da conta</Text>
            </View>
          </Button>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
