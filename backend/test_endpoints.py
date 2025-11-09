"""
Script de testes automáticos para Sync Ops Flow
Testa autenticação, importação/exportação e permissões
"""
import requests
import json
from typing import Dict, Optional
import sys

BASE_URL = "http://localhost:8001/api"

# Cores para output
GREEN = '\033[92m'
RED = '\033[91m'
YELLOW = '\033[93m'
BLUE = '\033[94m'
RESET = '\033[0m'


class TestRunner:
    def __init__(self):
        self.total_tests = 0
        self.passed_tests = 0
        self.failed_tests = 0
        self.admin_token = None
        self.operacional_token = None
    
    def test(self, name: str, func):
        """Executa um teste e registra resultado"""
        self.total_tests += 1
        print(f"\n{BLUE}[{self.total_tests}] {name}...{RESET}", end=" ")
        
        try:
            result = func()
            if result:
                self.passed_tests += 1
                print(f"{GREEN}✅ PASSOU{RESET}")
                return True
            else:
                self.failed_tests += 1
                print(f"{RED}❌ FALHOU{RESET}")
                return False
        except Exception as e:
            self.failed_tests += 1
            print(f"{RED}❌ ERRO: {str(e)}{RESET}")
            return False
    
    def print_summary(self):
        """Imprime resumo dos testes"""
        print(f"\n{'='*60}")
        print(f"{BLUE}RESUMO DOS TESTES{RESET}")
        print(f"{'='*60}")
        print(f"Total: {self.total_tests}")
        print(f"{GREEN}Passaram: {self.passed_tests}{RESET}")
        print(f"{RED}Falharam: {self.failed_tests}{RESET}")
        
        if self.failed_tests == 0:
            print(f"\n{GREEN}🎉 TODOS OS TESTES PASSARAM!{RESET}")
        else:
            print(f"\n{YELLOW}⚠️  Alguns testes falharam{RESET}")
    
    # ========== TESTES DE AUTENTICAÇÃO ==========
    
    def test_login_admin(self):
        """Testa login de admin"""
        response = requests.post(
            f"{BASE_URL}/auth/login",
            json={
                "email": "lukasantonyo@hotmail.com",
                "senha": "Testeintegrado1"
            }
        )
        
        if response.status_code == 200:
            data = response.json()
            self.admin_token = data.get("access_token")
            return bool(self.admin_token) and data.get("usuario", {}).get("perfil") == "admin"
        return False
    
    def test_login_operacional(self):
        """Testa login de usuário operacional"""
        response = requests.post(
            f"{BASE_URL}/auth/login",
            json={
                "email": "operacional@syncops.com",
                "senha": "Testeintegrado1"
            }
        )
        
        if response.status_code == 200:
            data = response.json()
            self.operacional_token = data.get("access_token")
            return bool(self.operacional_token) and data.get("usuario", {}).get("perfil") == "operacional"
        return False
    
    def test_login_invalid(self):
        """Testa login com credenciais inválidas"""
        response = requests.post(
            f"{BASE_URL}/auth/login",
            json={
                "email": "invalid@test.com",
                "senha": "wrongpassword"
            }
        )
        return response.status_code == 401
    
    def test_me_endpoint(self):
        """Testa endpoint /auth/me"""
        if not self.admin_token:
            return False
        
        response = requests.get(
            f"{BASE_URL}/auth/me",
            headers={"Authorization": f"Bearer {self.admin_token}"}
        )
        
        if response.status_code == 200:
            data = response.json()
            return data.get("email") == "lukasantonyo@hotmail.com"
        return False
    
    def test_me_without_token(self):
        """Testa /auth/me sem token (deve falhar)"""
        response = requests.get(f"{BASE_URL}/auth/me")
        return response.status_code == 403
    
    # ========== TESTES DE IMPORTAÇÃO/EXPORTAÇÃO ==========
    
    def test_import_without_auth(self):
        """Testa importação sem autenticação (deve falhar)"""
        with open("/tmp/test_frequencia.csv", "rb") as f:
            response = requests.post(
                f"{BASE_URL}/excel/frequencia/import",
                files={"file": f}
            )
        return response.status_code == 403
    
    def test_import_frequencia_with_auth(self):
        """Testa importação de frequência com autenticação"""
        if not self.admin_token:
            return False
        
        with open("/tmp/test_frequencia.csv", "rb") as f:
            response = requests.post(
                f"{BASE_URL}/excel/frequencia/import",
                headers={"Authorization": f"Bearer {self.admin_token}"},
                files={"file": f}
            )
        
        if response.status_code == 200:
            data = response.json()
            return data.get("criados", 0) > 0
        return False
    
    def test_export_frequencia_with_auth(self):
        """Testa exportação de frequência com autenticação"""
        if not self.admin_token:
            return False
        
        response = requests.get(
            f"{BASE_URL}/excel/frequencia/export",
            headers={"Authorization": f"Bearer {self.admin_token}"}
        )
        
        return response.status_code == 200 and len(response.content) > 0
    
    # ========== TESTES DE PERMISSÕES ==========
    
    def test_admin_can_access_logs(self):
        """Testa que admin pode acessar logs"""
        if not self.admin_token:
            return False
        
        response = requests.get(
            f"{BASE_URL}/logs/recent?limite=5",
            headers={"Authorization": f"Bearer {self.admin_token}"}
        )
        return response.status_code == 200
    
    def test_operacional_cannot_access_logs(self):
        """Testa que operacional NÃO pode acessar logs"""
        if not self.operacional_token:
            return False
        
        response = requests.get(
            f"{BASE_URL}/logs/recent?limite=5",
            headers={"Authorization": f"Bearer {self.operacional_token}"}
        )
        return response.status_code == 403
    
    def test_operacional_can_import(self):
        """Testa que operacional PODE fazer importação"""
        if not self.operacional_token:
            return False
        
        with open("/tmp/test_frequencia.csv", "rb") as f:
            response = requests.post(
                f"{BASE_URL}/excel/frequencia/import",
                headers={"Authorization": f"Bearer {self.operacional_token}"},
                files={"file": f}
            )
        
        return response.status_code == 200
    
    def test_admin_can_list_users(self):
        """Testa que admin pode listar usuários"""
        if not self.admin_token:
            return False
        
        response = requests.get(
            f"{BASE_URL}/auth/users",
            headers={"Authorization": f"Bearer {self.admin_token}"}
        )
        
        if response.status_code == 200:
            users = response.json()
            return len(users) >= 3  # Deve ter pelo menos 3 usuários
        return False
    
    def test_operacional_cannot_list_users(self):
        """Testa que operacional NÃO pode listar usuários"""
        if not self.operacional_token:
            return False
        
        response = requests.get(
            f"{BASE_URL}/auth/users",
            headers={"Authorization": f"Bearer {self.operacional_token}"}
        )
        return response.status_code == 403
    
    # ========== TESTES DE ENDPOINTS AUXILIARES ==========
    
    def test_health_check(self):
        """Testa endpoint de health check"""
        response = requests.get(f"{BASE_URL}/")
        return response.status_code == 200
    
    def test_status_endpoint(self):
        """Testa endpoint /status"""
        response = requests.get(f"{BASE_URL}/status")
        
        if response.status_code == 200:
            data = response.json()
            return data.get("status") == "online" and "collections" in data
        return False
    
    def test_version_endpoint(self):
        """Testa endpoint /version"""
        response = requests.get(f"{BASE_URL}/version")
        
        if response.status_code == 200:
            data = response.json()
            return data.get("version") == "2.0.0"
        return False
    
    # ========== TESTES DE LOGS ==========
    
    def test_logs_stats(self):
        """Testa estatísticas de logs"""
        if not self.admin_token:
            return False
        
        response = requests.get(
            f"{BASE_URL}/logs/stats",
            headers={"Authorization": f"Bearer {self.admin_token}"}
        )
        
        if response.status_code == 200:
            data = response.json()
            return "data" in data and data["data"].get("total", 0) > 0
        return False
    
    def run_all_tests(self):
        """Executa todos os testes"""
        print(f"\n{BLUE}{'='*60}")
        print(f"🧪 EXECUTANDO TESTES AUTOMÁTICOS - SYNC OPS FLOW")
        print(f"{'='*60}{RESET}\n")
        
        # Testes de Autenticação
        print(f"\n{YELLOW}📋 TESTES DE AUTENTICAÇÃO{RESET}")
        self.test("Login de Admin", self.test_login_admin)
        self.test("Login de Operacional", self.test_login_operacional)
        self.test("Login com credenciais inválidas", self.test_login_invalid)
        self.test("Endpoint /auth/me com token", self.test_me_endpoint)
        self.test("Endpoint /auth/me sem token", self.test_me_without_token)
        
        # Testes de Importação/Exportação
        print(f"\n{YELLOW}📊 TESTES DE IMPORTAÇÃO/EXPORTAÇÃO{RESET}")
        self.test("Importação sem autenticação", self.test_import_without_auth)
        self.test("Importação de frequência com auth", self.test_import_frequencia_with_auth)
        self.test("Exportação de frequência com auth", self.test_export_frequencia_with_auth)
        
        # Testes de Permissões
        print(f"\n{YELLOW}🔐 TESTES DE PERMISSÕES{RESET}")
        self.test("Admin pode acessar logs", self.test_admin_can_access_logs)
        self.test("Operacional NÃO pode acessar logs", self.test_operacional_cannot_access_logs)
        self.test("Operacional pode importar", self.test_operacional_can_import)
        self.test("Admin pode listar usuários", self.test_admin_can_list_users)
        self.test("Operacional NÃO pode listar usuários", self.test_operacional_cannot_list_users)
        
        # Testes de Endpoints Auxiliares
        print(f"\n{YELLOW}🏥 TESTES DE ENDPOINTS AUXILIARES{RESET}")
        self.test("Health check", self.test_health_check)
        self.test("Endpoint /status", self.test_status_endpoint)
        self.test("Endpoint /version", self.test_version_endpoint)
        
        # Testes de Logs
        print(f"\n{YELLOW}📝 TESTES DE LOGS{RESET}")
        self.test("Estatísticas de logs", self.test_logs_stats)
        
        # Resumo
        self.print_summary()
        
        return self.failed_tests == 0


if __name__ == "__main__":
    runner = TestRunner()
    success = runner.run_all_tests()
    sys.exit(0 if success else 1)
