-- MySQL dump 10.13  Distrib 8.0.46, for Win64 (x86_64)
--
-- Host: localhost    Database: controllo
-- ------------------------------------------------------
-- Server version	8.0.46

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `administracao`
--

DROP TABLE IF EXISTS `administracao`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `administracao` (
  `id_administracao` int NOT NULL AUTO_INCREMENT,
  `id_usuario` int NOT NULL,
  PRIMARY KEY (`id_administracao`),
  KEY `fk_id_usuario` (`id_usuario`),
  CONSTRAINT `fk_id_usuario` FOREIGN KEY (`id_usuario`) REFERENCES `usuarios` (`id_usuario`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `desativado`
--

DROP TABLE IF EXISTS `desativado`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `desativado` (
  `id_desativado` int NOT NULL AUTO_INCREMENT,
  `id_usuario` int NOT NULL,
  `tipo_usuario_antigo` enum('Administração','Manutenção','Geral') NOT NULL,
  PRIMARY KEY (`id_desativado`),
  KEY `idx_desativado_usuario` (`id_usuario`),
  CONSTRAINT `fk_desativado_usuario` FOREIGN KEY (`id_usuario`) REFERENCES `usuarios` (`id_usuario`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `geral`
--

DROP TABLE IF EXISTS `geral`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `geral` (
  `id_geral` int NOT NULL AUTO_INCREMENT,
  `id_usuario` int NOT NULL,
  PRIMARY KEY (`id_geral`),
  KEY `fk_geral_usuario` (`id_usuario`),
  CONSTRAINT `fk_geral_usuario` FOREIGN KEY (`id_usuario`) REFERENCES `usuarios` (`id_usuario`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `historicos_manutencao`
--

DROP TABLE IF EXISTS `historicos_manutencao`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `historicos_manutencao` (
  `id_historico` int NOT NULL AUTO_INCREMENT,
  `descricao` varchar(200) DEFAULT NULL,
  `id_requisicao` int NOT NULL,
  `acao` enum('Abertura','Andamento','Finalizacao') NOT NULL,
  `id_usuario` int DEFAULT NULL,
  `horario` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id_historico`),
  KEY `id_requisicao` (`id_requisicao`),
  KEY `horario` (`horario`),
  KEY `fk_historico_usuario` (`id_usuario`),
  CONSTRAINT `fk_historico_requisicao` FOREIGN KEY (`id_requisicao`) REFERENCES `requisicoes_manutencao` (`id_requisicao`) ON DELETE CASCADE,
  CONSTRAINT `fk_historico_usuario` FOREIGN KEY (`id_usuario`) REFERENCES `usuarios` (`id_usuario`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `historicos_ordem`
--

DROP TABLE IF EXISTS `historicos_ordem`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `historicos_ordem` (
  `id_historico` int NOT NULL AUTO_INCREMENT,
  `descricao` varchar(200) NOT NULL,
  `id_ordem` int NOT NULL,
  `fechamento` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id_historico`),
  KEY `fk_historico_ordem` (`id_ordem`),
  CONSTRAINT `fk_historico_ordem` FOREIGN KEY (`id_ordem`) REFERENCES `ordem_servico` (`id_ordem`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `itens_ordem`
--

DROP TABLE IF EXISTS `itens_ordem`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `itens_ordem` (
  `id_itens_ordem` int NOT NULL AUTO_INCREMENT,
  `id_ordem` int NOT NULL,
  `id_patrimonio` int NOT NULL,
  PRIMARY KEY (`id_itens_ordem`),
  KEY `fk_itens_ordem_ordem` (`id_ordem`),
  KEY `fk_itens_ordem_patrimonio` (`id_patrimonio`),
  CONSTRAINT `fk_itens_ordem_ordem` FOREIGN KEY (`id_ordem`) REFERENCES `ordem_servico` (`id_ordem`) ON DELETE CASCADE,
  CONSTRAINT `fk_itens_ordem_patrimonio` FOREIGN KEY (`id_patrimonio`) REFERENCES `patrimonio` (`id_patrimonio`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `manutencao`
--

DROP TABLE IF EXISTS `manutencao`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `manutencao` (
  `id_manutencao` int NOT NULL AUTO_INCREMENT,
  `id_usuario` int NOT NULL,
  PRIMARY KEY (`id_manutencao`),
  KEY `fk_manutencao_usuario` (`id_usuario`),
  CONSTRAINT `fk_manutencao_usuario` FOREIGN KEY (`id_usuario`) REFERENCES `usuarios` (`id_usuario`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `ordem_servico`
--

DROP TABLE IF EXISTS `ordem_servico`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `ordem_servico` (
  `id_ordem` int NOT NULL AUTO_INCREMENT,
  `descricao` varchar(200) NOT NULL,
  `status_ordem` enum('Pendente','Concluído') NOT NULL,
  `abertura` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id_ordem`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `patrimonio`
--

DROP TABLE IF EXISTS `patrimonio`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `patrimonio` (
  `id_patrimonio` int NOT NULL AUTO_INCREMENT,
  `nome` varchar(100) DEFAULT NULL,
  `status` enum('Pendente','Ok') NOT NULL,
  `id_sala` int NOT NULL,
  `caminho_imagem` varchar(255) DEFAULT NULL,
  `numero_patrimonio` varchar(12) NOT NULL,
  PRIMARY KEY (`id_patrimonio`),
  KEY `fk_patrimonio_sala` (`id_sala`),
  CONSTRAINT `fk_patrimonio_sala` FOREIGN KEY (`id_sala`) REFERENCES `salas` (`id_sala`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `pendente`
--

DROP TABLE IF EXISTS `pendente`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `pendente` (
  `id_pendente` int NOT NULL AUTO_INCREMENT,
  `id_usuario` int NOT NULL,
  `criado_em` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id_pendente`),
  UNIQUE KEY `uq_pendente_usuario` (`id_usuario`),
  CONSTRAINT `fk_pendente_usuario` FOREIGN KEY (`id_usuario`) REFERENCES `usuarios` (`id_usuario`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `requisicoes_manutencao`
--

DROP TABLE IF EXISTS `requisicoes_manutencao`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `requisicoes_manutencao` (
  `id_requisicao` int NOT NULL AUTO_INCREMENT,
  `descricao` varchar(200) DEFAULT NULL,
  `status_requisicao` enum('Pendente','Em andamento','Concluído') NOT NULL,
  `prioridade` enum('Alta','Media','Baixa') NOT NULL DEFAULT 'Media',
  `abertura` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `data_conclusao` timestamp NULL DEFAULT NULL,
  `atualizacao` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `id_patrimonio` int NOT NULL,
  `id_usuario_solicitante` int DEFAULT NULL,
  `id_usuario_responsavel` int DEFAULT NULL,
  PRIMARY KEY (`id_requisicao`),
  KEY `fk_requisicao_patrimonio` (`id_patrimonio`),
  KEY `fk_requisicao_solicitante` (`id_usuario_solicitante`),
  KEY `fk_requisicao_responsavel` (`id_usuario_responsavel`),
  KEY `id_patrimonio` (`id_patrimonio`,`status_requisicao`),
  KEY `status_requisicao` (`status_requisicao`,`abertura`),
  CONSTRAINT `fk_requisicao_patrimonio` FOREIGN KEY (`id_patrimonio`) REFERENCES `patrimonio` (`id_patrimonio`) ON DELETE CASCADE,
  CONSTRAINT `fk_requisicao_responsavel` FOREIGN KEY (`id_usuario_responsavel`) REFERENCES `usuarios` (`id_usuario`) ON DELETE SET NULL,
  CONSTRAINT `fk_requisicao_solicitante` FOREIGN KEY (`id_usuario_solicitante`) REFERENCES `usuarios` (`id_usuario`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `salas`
--

DROP TABLE IF EXISTS `salas`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `salas` (
  `id_sala` int NOT NULL AUTO_INCREMENT,
  `descricao` varchar(200) NOT NULL,
  `bloco` int NOT NULL,
  `caminho_imagem` varchar(255) DEFAULT NULL,
  `criado_em` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `atualizado_em` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id_sala`)
) ENGINE=InnoDB AUTO_INCREMENT=15 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `usuarios`
--

DROP TABLE IF EXISTS `usuarios`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `usuarios` (
  `id_usuario` int NOT NULL AUTO_INCREMENT,
  `nome` varchar(100) NOT NULL,
  `cpf` varchar(14) NOT NULL,
  `tipo_usuario` enum('Administração','Manutenção','Geral','Desativado','Pendente') NOT NULL,
  `email` varchar(100) DEFAULT NULL,
  `hash_senha` varchar(255) NOT NULL,
  `caminho_imagem` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id_usuario`),
  UNIQUE KEY `cpf` (`cpf`),
  UNIQUE KEY `email_UNIQUE` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=24 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `usuarios_ordem`
--

DROP TABLE IF EXISTS `usuarios_ordem`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `usuarios_ordem` (
  `id_usuarios_ordem` int NOT NULL AUTO_INCREMENT,
  `id_ordem` int NOT NULL,
  `id_usuario` int NOT NULL,
  PRIMARY KEY (`id_usuarios_ordem`),
  KEY `fk_usuario_ordem_ordem` (`id_ordem`),
  KEY `fk_usuario_ordem_usuario` (`id_usuario`),
  CONSTRAINT `fk_usuario_ordem_ordem` FOREIGN KEY (`id_ordem`) REFERENCES `ordem_servico` (`id_ordem`) ON DELETE CASCADE,
  CONSTRAINT `fk_usuario_ordem_usuario` FOREIGN KEY (`id_usuario`) REFERENCES `usuarios` (`id_usuario`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-10-08 18:31:17
