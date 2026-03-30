import React, { useState, useEffect } from 'react';
import { 
  Brain, Rocket, Trash2, Send, 
  ChevronLeft, Sparkles, History,
  LayoutGrid, ChevronRight, Activity,
  Info, BarChart, Zap, Target, Archive
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ResponsiveContainer,
  ComposedChart,
  XAxis,
  YAxis,
  Tooltip,
  Bar,
  ReferenceLine,
  Cell
} from 'recharts';
import { TopBar } from '../components/Navigation';
import { supabase } from '../lib/supabase';
import { useParams, useNavigate } from 'react-router-dom';
import { Student } from '../types/database';
import { cn } from '../lib/utils';

const dimensions = {
  'ATI/REF': { dim1: 'ATI', dim2: 'REF', label1: 'Ativo', label2: 'Reflexivo' },
  'SEN/INT': { dim1: 'SEN', dim2: 'INT', label1: 'Sensorial', label2: 'Intuitivo' },
  'VIS/VER': { dim1: 'VIS', dim2: 'VER', label1: 'Visual', label2: 'Verbal' },
  'SEQ/GLO': { dim1: 'SEQ', dim2: 'GLO', label1: 'Sequencial', label2: 'Global' }
} as const;

const explanations_full = {
  'ATI': 'Você prefere aprender fazendo, se envolver em atividades, discussões em grupo e experimentos. Você gosta de se mover e interagir para entender as coisas.',
  'REF': 'Você prefere aprender observando, pensando sobre o assunto antes de agir. Gosta de trabalhar sozinho e de ter tempo para refletir.',
  'SEN': 'Você prefere aprender sobre fatos e coisas concretas. Gosta de exemplos, de ver como as coisas funcionam na prática e de usar seus sentidos para aprender.',
  'INT': 'Você prefere aprender sobre ideias, teorias e conceitos abstratos. Gosta de inovar, de imaginar e de resolver problemas complexos.',
  'VIS': 'Você prefere aprender através de imagens, diagramas, gráficos e desenhos. O que você vê é o que você mais lembra.',
  'VER': 'Você prefere aprender através de palavras, tanto escritas quanto faladas. O que você lê ou ouve é o que você mais lembra.',
  'SEQ': 'Você prefere aprender passo a passo, de forma organizada e lógica. Você constrói o conhecimento aos poucos, de forma linear.',
  'GLO': 'Você prefere aprender de forma holística, vendo o "quadro geral" primeiro e depois se aprofundando nos detalhes. Você faz conexões entre diferentes assuntos.'
};

const questions = [
  { text: 'Quando estou aprendendo algo novo, eu prefiro:', scale: 'ATI/REF', value: { a: 'ATI', b: 'REF' }, options: [ { image: 'https://drive.google.com/thumbnail?id=157iPnw51K-an6D5R04lN8Rp2UbFCHuza', description: 'Conversar sobre isso com outras pessoas.' }, { image: 'https://drive.google.com/thumbnail?id=1WJb-bKM4QxWFfYvbDSJomunDR9DZloak', description: 'Pensar sozinho sobre o assunto antes de falar com alguém.' } ] },
  { text: 'Se eu fosse professor, eu preferiria ensinar sobre:', scale: 'SEN/INT', value: { a: 'SEN', b: 'INT' }, options: [ { image: 'https://drive.google.com/thumbnail?id=17QO0TgXoIgEste5mcPCdHsDGtEe43JDy', description: 'Coisas do mundo real, como animais ou a natureza.' }, { image: 'https://drive.google.com/thumbnail?id=16XjuwFTxuyYc1dUjrCPJOl3CKDgoA5dF', description: 'Ideias e pensamentos, como imaginar coisas novas.' } ] },
  { text: 'Eu aprendo melhor quando vejo:', scale: 'VIS/VER', value: { a: 'VIS', b: 'VER' }, options: [ { image: 'https://drive.google.com/thumbnail?id=1tdtnO2LKla61TdRIveh1zqMbUx7HH13M', description: 'Desenhos, fotos, gráficos e mapas.' }, { image: 'https://drive.google.com/thumbnail?id=1NbV1pWxWGsG_vjO4_bvK-UQyRpIF5cHY', description: 'Palavras escritas ou quando alguém me explica falando.' } ] },
  { text: 'Quando resolvo uma questão de Matemática, eu:', scale: 'SEQ/GLO', value: { a: 'SEQ', b: 'GLO' }, options: [ { image: 'https://drive.google.com/thumbnail?id=12PuQmgJtP__0BeSotQEmmMgomZ0GgaBu', description: 'Faço cada passo até chegar à resposta.' }, { image: 'https://drive.google.com/thumbnail?id=1muCVnnfo02qwKhQGGKwuI1Uw5Wn65KN-', description: 'Já sei a resposta, mas às vezes me atrapalho com os passos.' } ] },
  { text: 'Quando estou estudando com amigos, eu:', scale: 'ATI/REF', value: { a: 'ATI', b: 'REF' }, options: [ { image: 'https://drive.google.com/thumbnail?id=1dJ-U99V9xVjsXmV3-IqR0WjB9N6vdXaU', description: 'Gosto de dar ideias e falar sobre o assunto.' }, { image: 'https://drive.google.com/thumbnail?id=13YwqTtAiqR_gAy3_hUaNSKgy490ArtRT', description: 'Prefiro ouvir e pensar antes de falar.' } ] },
  { text: 'Eu acho mais fácil aprender:', scale: 'SEN/INT', value: { a: 'SEN', b: 'INT' }, options: [ { image: 'https://drive.google.com/thumbnail?id=1otZZFuR1uStTqY8_nD6-qgKuMhzJi39m', description: 'Fazendo experiências e testando.' }, { image: 'https://drive.google.com/thumbnail?id=1HL8TZA9Xy7P8En6HebluBAhdt2zwZv4q', description: 'Ouvindo explicações e entendendo a ideia.' } ] },
  { text: 'Quando leio um livro, eu:', scale: 'VIS/VER', value: { a: 'VIS', b: 'VER' }, options: [ { image: 'https://drive.google.com/thumbnail?id=1qHB5Wd9Ov80MxdE-M_k0LOBV5VW1lj7f', description: 'Olho primeiro as figuras e desenhos.' }, { image: 'https://drive.google.com/thumbnail?id=1bggaJKBTaM5CjEiH5ob_pwZCWZt1NqNj', description: 'Leio primeiro o texto.' } ] },
  { text: 'Prefiro quando meu professor:', scale: 'SEQ/GLO', value: { a: 'SEQ', b: 'GLO' }, options: [ { image: 'https://drive.google.com/thumbnail?id=1wvbeBVdByhcotDnMUICkwKf4mwEjVae-', description: 'Explica tudo passo a passo.' }, { image: 'https://drive.google.com/thumbnail?id=1Q2IOIxEu_ew2q6I6dJziKaECVJO458NT', description: 'Mostra o assunto todo e faz conexões com outras coisas.' } ] },
  { text: 'Meus amigos dizem que eu sou mais:', scale: 'ATI/REF', value: { a: 'ATI', b: 'REF' }, options: [ { image: 'https://drive.google.com/thumbnail?id=1baNLs5cE3wVd3FOJC5_uvreLN6cPIvO9', description: 'Animado e gosto de conversar com todo mundo.' }, { image: 'https://drive.google.com/thumbnail?id=1Il_foB5ZiU9uPrMDXZAFwl1pNCDe8sTA', description: 'Calmo, gosto de ficar mais na minha.' } ] },
  { text: 'Gosto mais de livros que:', scale: 'SEN/INT', value: { a: 'SEN', b: 'INT' }, options: [ { image: 'https://drive.google.com/thumbnail?id=1Ezwq-3ew1U3M_EQdcaBYGJtUhKAJxkuh', description: 'Me ensinam como fazer algo na prática.' }, { image: 'https://drive.google.com/thumbnail?id=1nWoHQ9nnBAgFT9D-8M4tgm8zEjjNiipr', description: 'Contem histórias ou ideias diferentes.' } ] },
  { text: 'Eu lembro melhor:', scale: 'VIS/VER', value: { a: 'VIS', b: 'VER' }, options: [ { image: 'https://drive.google.com/thumbnail?id=1L8en6ok52o6G9JVs5Ky4sTix9S-RliN7', description: 'Das coisas que vejo (como cores e formas).' }, { image: 'https://drive.google.com/thumbnail?id=1JgT81WIoc2_Ow0wmeK6ennGn9tBXSc5F', description: 'Das coisas que ouço (como músicas ou histórias).' } ] },
  { text: 'Quando estou aprendendo algo novo, eu:', scale: 'SEQ/GLO', value: { a: 'SEQ', b: 'GLO' }, options: [ { image: 'https://drive.google.com/thumbnail?id=11d1J6f2bcmC3Uv4Npc9iXadP3N3xOj5Q', description: 'Aprendo aos poucos, um passo de cada vez.' }, { image: 'https://drive.google.com/thumbnail?id=18K_cSrERPWyUXrxbvy6o7AOCYZzKpp1T', description: 'Fico confuso no começo, mas depois tenho uma grande ideia de repente!' } ] },
  { text: 'Eu gosto mais de estudar:', scale: 'ATI/REF', value: { a: 'ATI', b: 'REF' }, options: [ { image: 'https://drive.google.com/thumbnail?id=1i_axGZil0blcPtTS251Hc-tAizbtHCCO', description: 'Com amigos ou em grupo.' }, { image: 'https://drive.google.com/thumbnail?id=1B6xVyXaaxPzlEVUiLESIvjLuiTui43U0', description: 'Sozinho, no meu cantinho.' } ] },
  { text: 'Gosto mais de coisas que são:', scale: 'SEN/INT', value: { a: 'SEN', b: 'INT' }, options: [ { image: 'https://drive.google.com/thumbnail?id=1ks8mhHIjPEXpKp43uxNabPieFS89rX5R', description: 'Reais (como plantas, brinquedos ou experimentos).' }, { image: 'https://drive.google.com/thumbnail?id=1yR3qSkD5VjJaLBVKjuw-Bj3RlSk_rTYO', description: 'Inventadas (como super-heróis, jogos de imaginação).' } ] },
  { text: 'Quando o professor mostra um desenho no quadro:', scale: 'VIS/VER', value: { a: 'VIS', b: 'VER' }, options: [ { image: 'https://drive.google.com/thumbnail?id=1bPmu6ZtQs1S2a81QrDA1F9eqEIdbN2HW', description: 'Lembro mais da imagem.' }, { image: 'https://drive.google.com/thumbnail?id=10pHQpSOioTK6ouoghpB5LwJGou8UqoiF', description: 'Lembro mais do que ele explicou sobre ela.' } ] },
  { text: 'Quando aprendo algo novo, eu:', scale: 'SEQ/GLO', value: { a: 'SEQ', b: 'GLO' }, options: [ { image: 'https://drive.google.com/thumbnail?id=1sp6GJcZ1CladJ9WFJf73zhrPMAJPoXlq', description: 'Gosto de focar só nisso até aprender bem.' }, { image: 'https://drive.google.com/thumbnail?id=1EL5Mijz3Tfs0OWYqj2denmbhED_UhBka', description: 'Gosto de pensar como isso se liga a outras coisas que já sei.' } ] },
  { text: 'Meus amigos dizem que eu sou mais:', scale: 'ATI/REF', value: { a: 'ATI', b: 'REF' }, options: [ { image: 'https://drive.google.com/thumbnail?id=1Hcuoz7MC3RFhgVW109y0hTfk1tr6hNJw', description: 'Animado e gosto de conversar com todo mundo.' }, { image: 'https://drive.google.com/thumbnail?id=1zWIhMVPulOkJ4QuKDjwE9IBqqAYNVHT1', description: 'Calmo, gosto de ficar mais na minha.' } ] },
  { text: 'Gosto mais de aulas sobre:', scale: 'SEN/INT', value: { a: 'SEN', b: 'INT' }, options: [ { image: 'https://drive.google.com/thumbnail?id=12So9gs90pwd72dywZuhBT7_6OFswc462', description: 'Coisas que posso tocar ou ver (como animais, jogos).' }, { image: 'https://drive.google.com/thumbnail?id=11DaMc97rXVRH7WOWoY-4bL88FcdyF0pe', description: 'Coisas que imagino (como contos, estórias, invenções).' } ] },
  { text: 'Se alguém me explica algo, prefiro:', scale: 'VIS/VER', value: { a: 'VIS', b: 'VER' }, options: [ { image: 'https://drive.google.com/thumbnail?id=1sjCBElK6b1mBQ7tASkHnnSJ9pSDKcP2t', description: 'Gráficos, desenhos ou cores.' }, { image: 'https://drive.google.com/thumbnail?id=1_SNUfcf43T1JgoKrB3976cUZfdlcbvQx', description: 'Um resumo escrito ou falado.' } ] },
  { text: 'Quando estou resolvendo um problema, eu:', scale: 'SEQ/GLO', value: { a: 'SEQ', b: 'GLO' }, options: [ { image: 'https://drive.google.com/thumbnail?id=1Pbfs9857ZS-DIc_JEJWE6-y3WdsgULIu', description: 'Penso nos passos para chegar à resposta.' }, { image: 'https://drive.google.com/thumbnail?id=1IE0SMTadgWnnfPGdf8bGXdkRUdLla2pU', description: 'Já penso no resultado e depois volto para os detalhes.' } ] }
];

export default function StudentNILS() {
  const { studentId } = useParams();
  const navigate = useNavigate();
  const [student, setStudent] = useState<Student | null>(null);
  const [loading, setLoading] = useState(true);
  const [hasResult, setHasResult] = useState(false);
  const [resultsData, setResultsData] = useState<any[]>([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<Record<number, 'a' | 'b'>>({});
  const [isGeneratingIA, setIsGeneratingIA] = useState(false);
  const [iaAdvice, setIaAdvice] = useState<string | null>(null);
  const [activeResult, setActiveResult] = useState<any>(null);
  const [archivedTests, setArchivedTests] = useState<any[]>([]);
  const [showArchived, setShowArchived] = useState(false);
  const [profileCards, setProfileCards] = useState<any[]>([]);

  useEffect(() => {
    async function fetchData() {
      if (!studentId) return;
      
      const { data: studentData } = await supabase
        .from('students')
        .select('*')
        .eq('id', studentId)
        .single();
      
      if (studentData) setStudent(studentData);

      const { data: resultDataList } = await supabase
        .from('n_ils_responses')
        .select('*')
        .eq('student_id', studentId)
        .order('updated_at', { ascending: false });

      if (resultDataList && resultDataList.length > 0) {
        const active = resultDataList.find(r => r.status !== 'archived');
        const archived = resultDataList.filter(r => r.status === 'archived');
        
        if (active) {
          setHasResult(true);
          setActiveResult(active);
          processResultsFromDB(active);
        }
        setArchivedTests(archived);
      }
      setLoading(false);
    }
    fetchData();
  }, [studentId]);

  const processResultsFromDB = (data: any) => {
    const dif_ati_ref = (data.ati_val || 0) - (data.ref_val || 0);
    const dif_sen_int = (data.sen_val || 0) - (data.int_val || 0);
    const dif_vis_ver = (data.vis_val || 0) - (data.ver_val || 0);
    const dif_seq_glo = (data.seq_val || 0) - (data.glo_val || 0);

    const getIntensityText = (val: number) => {
      const abs = Math.abs(val);
      if (abs === 0) return 'Equilíbrio';
      if (abs <= 1) return 'Leve preferência';
      if (abs <= 3) return 'Preferência moderada';
      return 'Forte preferência';
    };

    const chartData = [
      {
        dimensao: 'Processamento',
        poloPositivo: 'Ativo (+)',
        poloNegativo: 'Reflexivo (-)',
        value: dif_ati_ref,
        intensity: getIntensityText(dif_ati_ref)
      },
      {
        dimensao: 'Percepção',
        poloPositivo: 'Sensorial (+)',
        poloNegativo: 'Intuitivo (-)',
        value: dif_sen_int,
        intensity: getIntensityText(dif_sen_int)
      },
      {
        dimensao: 'Entrada',
        poloPositivo: 'Visual (+)',
        poloNegativo: 'Verbal (-)',
        value: dif_vis_ver,
        intensity: getIntensityText(dif_vis_ver)
      },
      {
        dimensao: 'Entendimento',
        poloPositivo: 'Sequencial (+)',
        poloNegativo: 'Global (-)',
        value: dif_seq_glo,
        intensity: getIntensityText(dif_seq_glo)
      }
    ];

    const profiles = [];
    Object.entries(dimensions).forEach(([scaleKey, scaleInfo]) => {
      const dbPrefix = scaleKey.split('/')[0].toLowerCase();
      const dbSuffix = scaleKey.split('/')[1].toLowerCase();
      const score1 = data[`${dbPrefix}_val`] || 0;
      const score2 = data[`${dbSuffix}_val`] || 0;
      
      const difference = Math.abs(score1 - score2);
      let winnerLabel = 'Ambos';
      let explanation = 'Seu estilo é perfeitamente equilibrado entre essas duas extremidades.';

      if (score1 > score2) {
        winnerLabel = scaleInfo.label1;
        explanation = explanations_full[scaleInfo.dim1 as keyof typeof explanations_full];
      } else if (score2 > score1) {
        winnerLabel = scaleInfo.label2;
        explanation = explanations_full[scaleInfo.dim2 as keyof typeof explanations_full];
      }

      profiles.push({
        title: `${scaleInfo.label1} vs ${scaleInfo.label2}`,
        value: winnerLabel === 'Ambos' ? 'Equilibrado' : `${winnerLabel} (${difference <= 1 ? 'Leve' : difference <= 3 ? 'Moderada' : 'Forte'})`,
        desc: explanation
      });
    });

    setResultsData(chartData);
    setProfileCards(profiles);
  };

  const handleFinish = async () => {
    const scores = {
      'ATI/REF': { ATI: 0, REF: 0 },
      'SEN/INT': { SEN: 0, INT: 0 },
      'VIS/VER': { VIS: 0, VER: 0 },
      'SEQ/GLO': { SEQ: 0, GLO: 0 }
    };

    questions.forEach((q, index) => {
      const ans = answers[index];
      if (ans) {
        const selectedDim = q.value[ans];
        const scaleObj = scores[q.scale as keyof typeof scores] as Record<string, number>;
        if (scaleObj[selectedDim] !== undefined) {
          scaleObj[selectedDim]++;
        }
      }
    });

    const processedToSave = {
      ati_val: scores['ATI/REF'].ATI,
      ref_val: scores['ATI/REF'].REF,
      sen_val: scores['SEN/INT'].SEN,
      int_val: scores['SEN/INT'].INT,
      vis_val: scores['VIS/VER'].VIS,
      ver_val: scores['VIS/VER'].VER,
      seq_val: scores['SEQ/GLO'].SEQ,
      glo_val: scores['SEQ/GLO'].GLO,
      status: 'active',
      updated_at: new Date().toISOString()
    };

    const { error } = await supabase
      .from('n_ils_responses')
      .insert({ student_id: studentId, ...processedToSave });

    if (error) {
       console.error("Erro ao salvar no banco:", error);
       alert("Ocorreu um erro ao salvar (Verifique se a coluna 'status' foi criada no seu banco de dados Supabase).\n\nErro: " + error.message);
    } else {
       setHasResult(true);
       setActiveResult({ student_id: studentId, ...processedToSave });
       processResultsFromDB(processedToSave);
    }
  };

  const handleArchive = async () => {
    if (!activeResult) return;
    if (confirm('Deseja realmente arquivar este teste? A tela será liberada para um novo teste.')) {
      await supabase
        .from('n_ils_responses')
        .update({ status: 'archived', updated_at: new Date().toISOString() })
        .eq('id', activeResult.id);
      
      setHasResult(false);
      setResultsData([]);
      setCurrentStep(0);
      setAnswers({});
      setActiveResult(null);
      window.location.reload();
    }
  };

  const handleReset = async () => {
    if (!activeResult) return;
    if (confirm('Deseja realmente excluir este teste? Essa ação não pode ser desfeita.')) {
      await supabase.from('n_ils_responses').delete().eq('id', activeResult.id);
      setHasResult(false);
      setResultsData([]);
      setCurrentStep(0);
      setAnswers({});
      setActiveResult(null);
    }
  };

  const handleGenerateIA = async () => {
    if (iaAdvice) return;
    setIsGeneratingIA(true);

    const valProc = resultsData.find(d => d.dimensao === 'Processamento')?.value || 0;
    const valPerc = resultsData.find(d => d.dimensao === 'Percepção')?.value || 0;
    const valEntr = resultsData.find(d => d.dimensao === 'Entrada')?.value || 0;
    const valEnte = resultsData.find(d => d.dimensao === 'Entendimento')?.value || 0;

    const systemPrompt = `# ONTOLOGIA DO SISTEMA N-ILS E MOTOR DE INFERÊNCIA

Você é um motor de inferência pedagógica baseado estritamente no modelo N-ILS (New Index of Learning Styles).
É PROIBIDO utilizar conhecimentos externos ou inventar características fora deste JSON de regras.

## 1. MATRIZ DE DADOS (DATASET)
O modelo avalia 4 dimensões bipolares com valores de -5 a +5.
Intensidade: |0| (Equilíbrio perfeito), |1| (Equilibrado/Leve), |2 a 3| (Preferência Leve/Moderada), |4 a 5| (Preferência Forte).

* PROCESSAMENTO (+Ativo / -Reflexivo)
  - ATIVO (+): Aprende fazendo, interage. Comportamento: Trabalho em grupo. Forças: Engajamento experiencial. Fragilidade: Impulsividade. Estratégia: Projetos práticos.
  - REFLEXIVO (-): Aprende pensando. Comportamento: Observa antes de agir. Forças: Profundidade cognitiva. Fragilidade: Lentidão em ambientes dinâmicos. Estratégia: Tempo para reflexão individual.

* PERCEPÇÃO (+Sensorial / -Intuitivo)
  - SENSORIAL (+): Foco em fatos e dados. Comportamento: Prefere exemplos reais. Forças: Precisão, memória factual. Fragilidade: Dificuldade com abstração. Estratégia: Demonstrações concretas.
  - INTUITIVO (-): Foco em conceitos. Comportamento: Explora possibilidades. Forças: Pensamento estratégico, criatividade. Fragilidade: Erros por descuido. Estratégia: Problemas complexos abertos.

* ENTRADA (+Visual / -Verbal)
  - VISUAL (+): Aprende por imagens. Comportamento: Usa mapas mentais. Forças: Retenção visual, compreensão espacial. Fragilidade: Dificuldade com texto puro. Estratégia: Infográficos, diagramas.
  - VERBAL (-): Aprende por palavras. Comportamento: Prefere leitura e explicações. Forças: Comunicação, interpretação textual. Fragilidade: Menor aproveitamento visual. Estratégia: Debates, textos.

* ENTENDIMENTO (+Sequencial / -Global)
  - SEQUENCIAL (+): Aprendizagem linear. Comportamento: Segue lógica progressiva. Forças: Clareza, estruturação. Fragilidade: Dificuldade com visão sistêmica. Estratégia: Roteiros passo a passo.
  - GLOBAL (-): Aprendizagem por insight. Comportamento: Faz conexões amplas. Forças: Visão sistêmica, integração. Fragilidade: Confusão inicial. Estratégia: Visão geral antes do detalhe.

## 2. INSTRUÇÕES DE PROCESSAMENTO
Ao receber a entrada dinâmica ({processamento, percepcao, entrada, entendimento}):
1. Determine o polo dominante e a intensidade matemática de cada dimensão.
2. Identifique o Perfil Composto (Ex: "Sensorial-Visual-Ativo-Sequencial").
3. Estruture a saída em HTML (<h3>, <h4>, <ul>):
   - Resumo do Perfil Composto (Máximo de 3 linhas em itálico).
   - Análise Dimensional (Polo e Intensidade).
   - Contexto de Sala de Aula (Forças e Riscos/Fragilidades cruzadas).
   - Plano de Estratégias Docentes Recomendadas.`;

    const userQuery = `O estudante tem os seguintes resultados tabulados:
Processamento: ${valProc}
Percepção: ${valPerc}
Entrada: ${valEntr}
Entendimento: ${valEnte}

Com base EXCLUSIVAMENTE nas regras do seu sistema, gere a interpretação e as estratégias pedagógicas.`;

    try {
      const apiKey = (import.meta as any).env.VITE_GEMINI_API_KEY;
      if (!apiKey) {
        alert("Chave VITE_GEMINI_API_KEY não localizada.");
        setIsGeneratingIA(false);
        return;
      }

      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          systemInstruction: { parts: [{ text: systemPrompt }] },
          contents: [{ parts: [{ text: userQuery }] }],
          generationConfig: { temperature: 0.7 }
        })
      });

      const data = await response.json();
      if (!response.ok) {
        console.error("Gemini erro de resposta:", data);
        alert(`Erro da API Gemini:\n\n${data.error?.message || response.statusText}\n\nVerifique se a sua VITE_GEMINI_API_KEY do arquivo .env é realmente válida.`);
        return;
      }

      if (data?.candidates?.[0]?.content?.parts?.[0]?.text) {
        let text = data.candidates[0].content.parts[0].text;
        text = text.replace(/```html/g, "").replace(/```/g, "");
        setIaAdvice(text);
      } else {
        alert("Ocorreu um erro ao processar o retorno da IA. Detalhes: Formato de mensagem inesperado.");
      }
    } catch (err) {
      console.error(err);
      alert("Falha na comunicação com a API Gemini.");
    } finally {
      setIsGeneratingIA(false);
    }
  };

  if (loading) return <div>Carregando...</div>;

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <TopBar />
      
      <main className="max-w-6xl mx-auto px-6 py-12">
        <AnimatePresence mode="wait">
          {!hasResult ? (
            <motion.div 
              key="game"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-12"
            >
              <div className="bg-white rounded-[40px] p-10 atmospheric-shadow border border-slate-100 flex flex-col md:flex-row items-center gap-8 relative overflow-hidden">
                 <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-bl-[100px] -z-0" />
                 <div className="w-20 h-20 rounded-[32px] bg-primary text-white flex items-center justify-center shadow-xl shadow-primary/20 shrink-0">
                    <Rocket size={40} />
                 </div>
                 <div className="flex-1 text-center md:text-left">
                    <h1 className="text-3xl font-black text-on-surface mb-2">Olá, {student?.full_name?.split(' ')[0]}!</h1>
                    <p className="text-on-surface-variant font-medium opacity-60">Vamos descobrir o seu jeito favorito de aprender? Escolha as imagens que mais combinam com você!</p>
                 </div>
                 <div className="bg-primary/10 px-6 py-3 rounded-2xl flex flex-col items-center">
                    <span className="text-[10px] font-black text-primary uppercase tracking-widest">Progresso</span>
                    <span className="text-2xl font-black text-primary">{Math.round(((currentStep + 1) / questions.length) * 100)}%</span>
                 </div>
              </div>

              <section className="max-w-5xl mx-auto bg-white rounded-[48px] p-8 md:p-12 atmospheric-shadow border border-slate-100 min-h-[500px] w-full relative">
                 <motion.div 
                   key={currentStep}
                   initial={{ opacity: 0, x: 20 }}
                   animate={{ opacity: 1, x: 0 }}
                   className="w-full h-full flex flex-col items-center justify-between gap-10"
                 >
                    <div className="text-center space-y-2">
                       <h2 className="text-3xl md:text-4xl font-black text-on-surface leading-tight tracking-tight max-w-2xl mx-auto">
                          {questions[currentStep].text}
                       </h2>
                    </div>

                    <div className="flex flex-col sm:flex-row items-stretch justify-center gap-6 sm:gap-8 w-full max-w-4xl">
                       {(['a', 'b'] as const).map((optKey, idx) => (
                         <button 
                           key={optKey}
                           onClick={() => setAnswers({ ...answers, [currentStep]: optKey })}
                           className={cn(
                             "group flex-1 relative p-4 rounded-[40px] border-4 transition-all active:scale-95 text-left h-auto min-h-[300px] flex flex-col",
                             answers[currentStep] === optKey 
                               ? "border-primary bg-primary/5 shadow-2xl shadow-primary/20 scale-105" 
                               : "border-transparent bg-slate-50 hover:bg-white hover:border-slate-100 hover:scale-[1.02]"
                           )}
                         >
                            <div className="w-full bg-slate-200 rounded-[32px] overflow-hidden aspect-video relative mb-6">
                              <img 
                                src={questions[currentStep].options[idx].image} 
                                alt="Opção" 
                                className="w-full h-full object-contain bg-black/5" 
                                onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src='https://placehold.co/400x400/cccccc/ffffff?text=Imagem+Indisponível' }}
                              />
                            </div>
                            <div className="px-2 flex items-center justify-between gap-4 mt-auto">
                               <p className="text-xl font-bold text-on-surface leading-tight font-serif flex-1">{questions[currentStep].options[idx].description}</p>
                               <div className={cn(
                                 "w-10 h-10 shrink-0 rounded-full border-2 flex items-center justify-center transition-all",
                                 answers[currentStep] === optKey ? "bg-primary border-primary text-white" : "border-slate-300 text-transparent"
                               )}>
                                  <Send size={18} />
                               </div>
                            </div>
                         </button>
                       ))}
                    </div>

                    <div className="flex gap-4 w-full max-w-md mt-4">
                       <button 
                         disabled={currentStep === 0}
                         onClick={() => setCurrentStep(prev => prev - 1)}
                         className="flex-1 py-5 rounded-[24px] bg-slate-100 text-slate-400 font-black text-[10px] uppercase tracking-widest hover:bg-slate-900 hover:text-white transition-all disabled:opacity-30 disabled:hover:bg-slate-100 disabled:hover:text-slate-400 flex items-center justify-center gap-2"
                       >
                          <ChevronLeft size={16} /> Anterior
                       </button>
                       {currentStep < questions.length - 1 ? (
                         <button 
                           disabled={!answers[currentStep]}
                           onClick={() => setCurrentStep(prev => prev + 1)}
                           className="flex-[2] py-5 px-12 rounded-[24px] bg-primary text-white font-black text-[10px] uppercase tracking-widest shadow-xl shadow-primary/30 hover:scale-105 transition-all disabled:opacity-50 disabled:hover:scale-100 flex items-center justify-center gap-2"
                         >
                            Próximo <ChevronRight size={16} />
                         </button>
                       ) : (
                         <button 
                           disabled={!answers[currentStep]}
                           onClick={handleFinish}
                           className="flex-[2] py-5 px-12 rounded-[24px] bg-green-500 text-white font-black text-[10px] uppercase tracking-widest shadow-xl shadow-green-500/30 hover:scale-105 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                         >
                            Finalizar Jogo <Zap size={16} />
                         </button>
                       )}
                    </div>
                 </motion.div>
              </section>
            </motion.div>
          ) : (
            <motion.div 
              key="results"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-12"
            >
              <div className="flex justify-between items-center mb-12 flex-wrap gap-4">
                 <div className="space-y-2">
                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary/10 rounded-full text-primary font-black text-[10px] uppercase tracking-widest">
                       <Brain size={12} /> Resultado Consolidado
                    </div>
                    <h1 className="text-5xl font-black text-on-surface tracking-tight">Seu Estilo de Aprendizagem</h1>
                 </div>
                 <div className="flex items-center gap-3">
                    <button 
                      onClick={handleArchive}
                      className="p-4 bg-slate-50 text-slate-500 rounded-2xl hover:bg-slate-200 hover:text-slate-800 transition-all border border-slate-200 shadow-sm flex items-center gap-2 text-xs font-black uppercase tracking-widest"
                    >
                       <Archive size={16} /> Arquivar Teste
                    </button>
                    <button 
                      onClick={handleReset}
                      className="p-4 bg-red-50 text-red-600 rounded-2xl hover:bg-red-600 hover:text-white transition-all border border-red-100 shadow-sm flex items-center gap-2 text-xs font-black uppercase tracking-widest"
                    >
                       <Trash2 size={16} /> Excluir
                    </button>
                 </div>
              </div>

              <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-start">
                 <section className="bg-white rounded-[40px] p-8 md:p-10 atmospheric-shadow border border-slate-100 flex flex-col items-center overflow-x-auto xl:col-span-8 min-h-[550px]">
                    <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6 w-full text-center">Escalas Dimensionais Contínuas (Bipolar)</h3>
                    <BipolarRadarChart data={resultsData} />
                 </section>

                 <div className="space-y-4 xl:col-span-4 flex flex-col h-full">
                    <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest pt-4 pb-2 px-2">Interpretação das Dimensões</h3>
                    <div className="flex-1 space-y-3 overflow-y-auto pr-2 custom-scrollbar">
                       {profileCards.map((p, i) => (
                         <ProfileAccordionCard 
                           key={i}
                           title={p.title}
                           value={p.value}
                           desc={p.desc}
                           icon={Target}
                         />
                       ))}
                    </div>

                    <section className="bg-gradient-to-br from-slate-900 to-primary rounded-[32px] p-8 shadow-2xl shadow-primary/20 text-white relative overflow-hidden flex-shrink-0 mt-4">
                       <div className="absolute top-0 right-0 w-48 h-48 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
                       <div className="relative z-10 flex items-center justify-between gap-6">
                          <div>
                             <h2 className="text-xl font-black mb-1">Dicas Singul-AH AI</h2>
                             <p className="text-white/70 font-medium text-xs">Maximize seu potencial.</p>
                          </div>
                          <button 
                             onClick={handleGenerateIA}
                             disabled={isGeneratingIA || iaAdvice !== null}
                             className="bg-white text-primary w-14 h-14 rounded-full flex items-center justify-center hover:scale-105 active:scale-95 transition-all shadow-xl shrink-0 disabled:opacity-50 disabled:hover:scale-100"
                           >
                              {isGeneratingIA && !iaAdvice ? (
                                <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                              ) : (
                                <Sparkles size={24} />
                              )}
                           </button>
                       </div>
                    </section>

                    <AnimatePresence>
                       {(isGeneratingIA || iaAdvice) && (
                         <motion.div 
                           initial={{ opacity: 0, height: 0 }}
                           animate={{ opacity: 1, height: 'auto' }}
                           className="bg-white rounded-[40px] p-8 md:p-10 atmospheric-shadow border border-slate-100 overflow-hidden mt-4"
                         >
                            <div className="flex items-center gap-3 mb-6">
                               <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                                  <Sparkles size={20} />
                               </div>
                               <h3 className="text-xl font-black text-on-surface">Laudo Pedagógico (Singul-AH AI)</h3>
                            </div>
                            
                            {!iaAdvice ? (
                              <div className="space-y-4 animate-pulse">
                                 <div className="h-4 bg-slate-100 rounded w-3/4"></div>
                                 <div className="h-4 bg-slate-100 rounded w-full"></div>
                                 <div className="h-4 bg-slate-100 rounded w-5/6"></div>
                              </div>
                            ) : (
                              <div 
                                className="prose prose-sm md:prose-base prose-slate max-w-none prose-headings:font-black prose-h3:text-lg prose-h4:text-base prose-h4:text-primary prose-a:text-primary"
                                dangerouslySetInnerHTML={{ __html: iaAdvice }}
                              />
                            )}
                         </motion.div>
                       )}
                    </AnimatePresence>
                  </div>
              </div>

              {/* Arquivados Accordion */}
              {archivedTests.length > 0 && (
                <div className="mt-16">
                   <button 
                     onClick={() => setShowArchived(!showArchived)}
                     className="w-full bg-slate-100/50 hover:bg-slate-100 border border-slate-200 rounded-[32px] p-6 flex items-center justify-between transition-all"
                   >
                     <div className="flex items-center gap-4">
                       <History className="text-slate-400" />
                       <span className="font-black text-slate-500 uppercase tracking-widest text-sm">Ver Histórico Arquivado ({archivedTests.length})</span>
                     </div>
                     <ChevronRight className={cn("text-slate-400 transition-transform", showArchived && "rotate-90")} />
                   </button>
                   
                   <AnimatePresence>
                     {showArchived && (
                       <motion.div 
                         initial={{ opacity: 0, height: 0 }}
                         animate={{ opacity: 1, height: 'auto' }}
                         exit={{ opacity: 0, height: 0 }}
                         className="overflow-hidden"
                       >
                         <div className="pt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {archivedTests.map(test => (
                               <div key={test.id} className="bg-slate-50 border border-slate-200 rounded-3xl p-6 opacity-70 grayscale hover:grayscale-0 hover:opacity-100 transition-all flex flex-col gap-4">
                                  <div className="flex justify-between items-start">
                                    <div className="bg-slate-200 text-slate-500 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest inline-flex items-center gap-2">
                                       <Archive size={12} /> Arquivado
                                    </div>
                                    <span className="text-[10px] font-bold text-slate-400">{new Date(test.updated_at).toLocaleDateString()}</span>
                                  </div>
                                  <div>
                                    <p className="font-black text-on-surface text-lg">Estatísticas Antigas</p>
                                    <div className="grid grid-cols-2 gap-2 mt-4 text-xs font-bold text-slate-500">
                                       <span className="bg-white px-3 py-2 rounded-xl">Ativo: {test.ati_val}</span>
                                       <span className="bg-white px-3 py-2 rounded-xl">Reflexivo: {test.ref_val}</span>
                                       <span className="bg-white px-3 py-2 rounded-xl">Sensorial: {test.sen_val}</span>
                                       <span className="bg-white px-3 py-2 rounded-xl">Intuitivo: {test.int_val}</span>
                                       <span className="bg-white px-3 py-2 rounded-xl">Visual: {test.vis_val}</span>
                                       <span className="bg-white px-3 py-2 rounded-xl">Verbal: {test.ver_val}</span>
                                       <span className="bg-white px-3 py-2 rounded-xl">Sequencial: {test.seq_val}</span>
                                       <span className="bg-white px-3 py-2 rounded-xl">Global: {test.glo_val}</span>
                                    </div>
                                  </div>
                               </div>
                            ))}
                         </div>
                       </motion.div>
                     )}
                   </AnimatePresence>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}

function ProfileAccordionCard({ title, value, desc, icon: Icon }: any) {
  return (
    <details className="group bg-slate-50 border border-slate-200 rounded-[28px] overflow-hidden shadow-sm hover:border-slate-300 open:bg-white open:ring-1 open:ring-primary/20 open:shadow-lg transition-all">
      <summary className="p-5 cursor-pointer list-none flex items-center justify-between gap-4 font-black text-slate-800 hover:bg-slate-100 group-open:bg-transparent transition-all">
        <div className="flex items-center gap-4">
           <div className="w-10 h-10 shrink-0 rounded-[16px] bg-white text-primary flex items-center justify-center shadow-sm group-open:bg-primary group-open:text-white transition-all">
             <Icon size={18} />
           </div>
           <div className="text-left flex-1 min-w-0">
             <span className="block text-[9px] uppercase tracking-widest text-slate-400 font-bold mb-0.5 truncate">{title}</span>
             <span className="block text-sm sm:text-base leading-tight truncate">{value}</span>
           </div>
        </div>
        <ChevronRight size={18} className="text-slate-400 group-open:rotate-90 transition-transform shrink-0" />
      </summary>
      <div className="px-5 pb-6 pt-1 text-slate-500 font-medium text-xs leading-relaxed border-t border-slate-100 mx-5">
        {desc}
      </div>
    </details>
  );
}

// Customized Recharts Shape to draw the line and circle
const CustomBarShape = (props: any) => {
  const { x, y, width, height, isNegative, intensityLevel } = props;
  
  // Colors logic
  const colors = {
    forte: { fill: "#1D4ED8", stroke: "#1E3A8A", endFill: "#FFFFFF" },
    moderada: { fill: "#3B82F6", stroke: "#2563EB", endFill: "#FFFFFF" },
    leve: { fill: "#93C5FD", stroke: "#60A5FA", endFill: "#EFF6FF" }
  };
  const theme = colors[intensityLevel as keyof typeof colors] || colors.leve;

  // We draw a capsule and a circle at the end
  const barY = y + height / 2 - 6;
  const barHeight = 12;

  // Determine circle X specifically taking into account animation progress
  const circleX = isNegative ? x : x + width;
  
  return (
    <g>
      <rect 
        x={x} 
        y={barY} 
        width={width} 
        height={barHeight} 
        fill={theme.fill}
        rx={6}
      />
      <circle 
        cx={circleX} 
        cy={barY + 6} 
        r={10} 
        fill={theme.endFill} 
        stroke={theme.fill} 
        strokeWidth={4} 
      />
    </g>
  );
};

// Customized Tick Label for Y Axis (Esquerda e Direita)
const YAxisCustomTick = (props: any) => {
  const { x, y, payload, align = "end" } = props;
  return (
    <g transform={`translate(${x},${y})`}>
      <text 
        x={0} 
        y={0} 
        dy={4} 
        textAnchor={align} 
        fill="#64748b" 
        className="text-[10px] font-black uppercase tracking-widest"
      >
        {payload.value}
      </text>
    </g>
  );
};

function BipolarRadarChart({ data }: { data: any[] }) {
  const [animatedData, setAnimatedData] = useState(
    data.map((d) => ({ ...d, valorAnimado: 0 }))
  );

  useEffect(() => {
    let frame = 0;
    const totalFrames = 15; // 0.25 second roughly at 60fps

    const animate = () => {
      frame++;
      const progress = frame / totalFrames;
      // Easing suave cubic-out
      const easeOut = 1 - Math.pow(1 - progress, 3);

      setAnimatedData(
        data.map((d) => ({
          ...d,
          valorAnimado: d.value * easeOut,
        }))
      );

      if (frame < totalFrames) {
        requestAnimationFrame(animate);
      }
    };

    requestAnimationFrame(animate);
  }, [data]);

  return (
    <div className="w-full h-[450px]">
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart
          layout="vertical"
          data={animatedData}
          margin={{ top: 40, right: 10, left: 10, bottom: 20 }}
        >
          {/* Eixo X com labels do extremo */}
          <XAxis
            type="number"
            domain={[-5.5, 5.5]}
            tick={(props) => {
               // Renderizar os ticks -5, -3, -1, 1, 3, 5
               const { x, y, payload } = props;
               if (![-5, -3, -1, 0, 1, 3, 5].includes(payload.value)) return null;
               
               let display = payload.value.toString();
               if (payload.value > 0) display = `+${payload.value}`;
               if (payload.value === 0) display = "0";

               return (
                 <text x={x} y={y + 15} textAnchor="middle" fill={payload.value === 0 ? "#94A3B8" : "#CBD5E1"} className="text-[10px] font-bold">
                   {display}
                 </text>
               );
            }}
            axisLine={false}
            tickLine={false}
          />

          {/* Eixo Y da Esquerda (Pólo Negativo) */}
          <YAxis
            yAxisId="left"
            type="category"
            dataKey="poloNegativo"
            tick={<YAxisCustomTick align="end" />}
            axisLine={false}
            tickLine={false}
            width={100}
            orientation="left"
          />

          {/* Eixo Y da Direita (Pólo Positivo) */}
          <YAxis
            yAxisId="right"
            type="category"
            dataKey="poloPositivo"
            tick={<YAxisCustomTick align="start" />}
            axisLine={false}
            tickLine={false}
            width={100}
            orientation="right"
          />

          <ReferenceLine yAxisId="left" x={0} stroke="#94A3B8" strokeDasharray="4 4" strokeWidth={2} />

          <Tooltip
            cursor={{ fill: '#F1F5F9', fillOpacity: 0.5, radius: 10 }}
            content={({ active, payload }) => {
              if (active && payload && payload.length) {
                const d = payload[0].payload;
                const v = Math.round(d.valorAnimado * 10) / 10; // keep it readable during anim
                const fullV = d.value;
                const signVal = fullV > 0 ? `+${fullV}` : fullV;
                const isNeg = d.valorAnimado < 0;

                return (
                   <div className="bg-white p-4 rounded-xl shadow-2xl border border-slate-100 z-50 pointer-events-none min-w-[200px]">
                      <p className="font-black text-slate-400 uppercase tracking-widest text-[9px] mb-1">{d.dimensao}</p>
                      <p className="font-bold text-on-surface text-sm leading-tight mb-1">
                        {isNeg ? d.poloNegativo : d.poloPositivo} 
                        <span className={isNeg ? "text-rose-500 ml-1" : "text-primary ml-1"}>
                          ({signVal})
                        </span>
                      </p>
                      <p className="font-semibold text-primary/80 text-xs">{d.intensity}</p>
                   </div>
                );
              }
              return null;
            }}
          />

          <Bar
            yAxisId="left"
            dataKey="valorAnimado"
            isAnimationActive={false}
            shape={(props: any) => {
              const { x, width } = props;
              const d = animatedData[props.index];
              const isNegative = d.valorAnimado < 0;
              const absVal = Math.abs(d.value);
              
              let intensityLevel = "leve";
              if (absVal >= 4) intensityLevel = "forte";
              else if (absVal >= 2) intensityLevel = "moderada";

              // Ponto X do centro do gráfico (linha 0)
              // Se a barra é negativa, o centro é no limite direito da barra
              // Se for positiva, o centro é no limite esquerdo da barra
              const centerX = isNegative ? x + width : x;
              const barY = props.y + props.height / 2 - 6;

              return (
                <g>
                   {/* Fundo branco para não sobrepor o pontilhado */}
                   <text 
                     x={centerX} 
                     y={barY - 16} 
                     textAnchor="middle" 
                     stroke="white"
                     strokeWidth={6}
                     strokeLinejoin="round"
                     className="text-[10px] font-black uppercase tracking-widest pointer-events-none"
                   >
                     {d.dimensao}
                   </text>
                   {/* Título da Dimensão Absolutamente no Topo, Centralizado no Eixo 0 */}
                   <text 
                     x={centerX} 
                     y={barY - 16} 
                     textAnchor="middle" 
                     className="text-[10px] font-black fill-slate-800 uppercase tracking-widest pointer-events-none"
                   >
                     {d.dimensao}
                   </text>

                   <CustomBarShape {...props} isNegative={isNegative} intensityLevel={intensityLevel} />
                </g>
              );
            }}
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}
