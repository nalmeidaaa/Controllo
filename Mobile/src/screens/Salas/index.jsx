import React, { useCallback, useState } from 'react';
import {
  View,
  StyleSheet,
  Text,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { ArrowLeft, DoorOpen, MoveRight } from 'lucide-react-native';
import { obterToken } from '../../storage/usuario/dados.storage.js';
import { buscarSalas } from '../../services/salaService.js';
import { BASE_URL } from "../../services/api.js"; 

const iconColor = '#c9131c';

export default function SalasScreen() {
  const navigation = useNavigation();
  const [salas, setSalas] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState(false);

  async function carregarSalas() {
    try {
      setCarregando(true);
      setErro(false);
      const token = await obterToken();
      if (!token) return;

      const resposta = await buscarSalas(token);
      setSalas(resposta?.result ?? []);
    } catch (error) {
      console.error('Erro ao buscar salas', error);
      setErro(true);
    } finally {
      setCarregando(false);
    }
  }

  useFocusEffect(
    useCallback(() => {
      carregarSalas();
    }, [])
  );

  function abrirSala(sala) {
    navigation.navigate('SalaDetalheScreen', {
      idSala: sala.id_sala,
      nomeSala: sala.descricao,
    });
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.headerRow}>
          <TouchableOpacity
            style={styles.voltarButton}
            activeOpacity={0.8}
            onPress={() => navigation.goBack()}
          >
            <ArrowLeft color={iconColor} size={22} />
          </TouchableOpacity>
          <View style={styles.heading}>
            <Text style={styles.eyebrow}>Controllo</Text>
            <Text style={styles.title}>Salas</Text>
          </View>
        </View>

        {carregando ? (
          <View style={styles.centro}>
            <ActivityIndicator size="large" color={iconColor} />
          </View>
        ) : erro ? (
          <View style={styles.centro}>
            <Text style={styles.mensagemVazia}>
              Não foi possível carregar as salas.
            </Text>
          </View>
        ) : salas.length === 0 ? (
          <View style={styles.centro}>
            <Text style={styles.mensagemVazia}>
              Nenhuma sala cadastrada.
            </Text>
          </View>
        ) : (
          <FlatList
            data={salas}
            keyExtractor={(item) => String(item.id_sala)}
            contentContainerStyle={styles.lista}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.card}
                activeOpacity={0.8}
                onPress={() => abrirSala(item)}
              >
                {/* Linha superior com os textos e a seta */}
                <View style={styles.cardHeaderRow}>
                  <View style={styles.cardText}>
                    <Text style={styles.cardTitle}>{item.descricao}</Text>
                    {!!item.bloco && (
                      <Text style={styles.cardSubtitle}>Bloco {item.bloco}</Text>
                    )}
                  </View>
                  <MoveRight color="#b01d2e" size={22} />
                </View>

                {/* Imagem retangular grande posicionada abaixo do texto */}
                {item.caminho_imagem ? (
                  <Image 
                    source={{ uri: `${BASE_URL}${item.caminho_imagem}` }} 
                    style={styles.salaImagemGrande} 
                    resizeMode="cover"
                  />
                ) : (
                  <View style={styles.placeholderRetangular}>
                    <DoorOpen color={iconColor} size={32} />
                    <Text style={styles.placeholderTexto}>Sem imagem disponível</Text>
                  </View>
                )}
              </TouchableOpacity>
            )}
          />
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { 
    flex: 1, 
    backgroundColor: '#f4f7f7', 
  },
  container: { 
    flex: 1, 
    paddingHorizontal: 28, 
    paddingTop: 40, 
  },
  headerRow: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    marginBottom: 28, 
  },
  voltarButton: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#ffd8d8',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  heading: { 
    flex: 1, 
  },
  eyebrow: {
    color: '#b01d2e',
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.7,
  },
  title: {
    color: '#2d0e0e',
    fontSize: 24,
    fontWeight: '600',
    letterSpacing: -0.5,
    marginTop: 4,
  },
  lista: { 
    gap: 16, 
    paddingBottom: 40, 
  },
  card: {
    flexDirection: 'column', // Mudado para coluna para empilhar conteúdo verticalmente
    backgroundColor: '#ffffff',
    borderRadius: 14,
    padding: 20,
    borderWidth: 1,
    borderColor: '#fce9e9',
    shadowColor: '#101010',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 2,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16, // Espaço entre o texto superior e a imagem abaixo
  },
  cardText: { 
    flex: 1, 
  },
  cardTitle: { 
    color: '#270d0d', 
    fontSize: 18, // Aumentado um pouco para destacar melhor no card vertical
    fontWeight: '600', 
  },
  cardSubtitle: { 
    color: '#8a7373', 
    fontSize: 14, 
    marginTop: 2, 
  },
  salaImagemGrande: {
    width: '100%',
    height: 160, // Proporção retangular
    borderRadius: 10,
    backgroundColor: '#ffd8d8',
  },
  placeholderRetangular: {
    width: '100%',
    height: 160,
    borderRadius: 10,
    backgroundColor: '#fff1f1',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderRadius: 10,
    borderColor: '#fce9e9',
    borderStyle: 'dashed',
    gap: 8,
  },
  placeholderTexto: {
    color: '#8a7373',
    fontSize: 13,
  },
  centro: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: 80,
  },
  mensagemVazia: { 
    color: '#8a7373', 
    fontSize: 14, 
    textAlign: 'center', 
  },
});
