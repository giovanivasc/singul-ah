import React, { useState, useEffect } from 'react';
import { 
  Brain, Rocket, Trash2, Send, 
  ChevronLeft, Sparkles, History,
  LayoutGrid, ChevronRight, Activity,
  Info, BarChart, Zap, Target, Archive
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Radar, RadarChart, PolarGrid, 
  PolarAngleAxis, PolarRadiusAxis, 
  ResponsiveContainer 
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
        .from('nils_results')
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
    // Nós podemos tentar recalcular a diferença a partir dos saves se existirem os campos ati_val etc.
    // Mas vamos usar os values que salvamos ou os brutos disponíveis:
    const chartData = [];
    const profiles = [];
    
    Object.entries(dimensions).forEach(([scaleKey, scaleInfo]) => {
      const dbPrefix = scaleKey.split('/')[0].toLowerCase();
      const dbSuffix = scaleKey.split('/')[1].toLowerCase();
      const score1 = data[`${dbPrefix}_val`] || 0;
      const score2 = data[`${dbSuffix}_val`] || 0;
      
      const difference = Math.abs(score1 - score2);
      let winner = 'Ambos';
      let winnerLabel = 'Ambos';
      let intensity = 0;
      let text = 'Não há preferência. Você tem um estilo de aprendizagem equilibrado.';
      let explanation = 'Seu estilo é perfeitamente equilibrado entre essas duas extremidades.';

      if (score1 > score2) {
        winner = scaleInfo.dim1;
        winnerLabel = scaleInfo.label1;
      } else if (score2 > score1) {
        winner = scaleInfo.dim2;
        winnerLabel = scaleInfo.label2;
      }

      if (winner !== 'Ambos') {
        explanation = explanations_full[winner as keyof typeof explanations_full];
        if (difference === 1) {
          text = `Leve preferência por: ${winnerLabel}.`;
          intensity = 1;
        } else if (difference <= 3) {
          text = `Preferência moderada por: ${winnerLabel}. ${explanation}`;
          intensity = 3;
        } else {
          text = `Forte preferência por: ${winnerLabel}. ${explanation}`;
          intensity = 5;
        }
      }

      // Gráfico apenas "puxa" para o vencedor
      chartData.push({ subject: scaleInfo.label1, A: winner === scaleInfo.dim1 ? intensity : 0 });
      chartData.push({ subject: scaleInfo.label2, A: winner === scaleInfo.dim2 ? intensity : 0 });

      profiles.push({
        title: `${scaleInfo.label1} vs ${scaleInfo.label2}`,
        value: winnerLabel === 'Ambos' ? 'Equilibrado' : `${winnerLabel} (${difference === 1 ? 'Leve' : difference <= 3 ? 'Moderada' : 'Forte'})`,
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
      .from('nils_results')
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
        .from('nils_results')
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
      await supabase.from('nils_results').delete().eq('id', activeResult.id);
      setHasResult(false);
      setResultsData([]);
      setCurrentStep(0);
      setAnswers({});
      setActiveResult(null);
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
              {/* Game Phase Header */}
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

              {/* Game Card */}
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
              {/* Results Header */}
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

              {/* Results Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                 {/* Radar Chart Card */}
                 <section className="bg-white rounded-[40px] p-10 atmospheric-shadow border border-slate-100 flex flex-col items-center">
                    <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-10">Mapeamento Dimensional</h3>
                    <div className="w-full h-[400px]">
                       <ResponsiveContainer width="100%" height="100%">
                         <RadarChart cx="50%" cy="50%" outerRadius="80%" data={resultsData}>
                           <PolarGrid stroke="#E2E8F0" />
                           <PolarAngleAxis dataKey="subject" tick={{ fill: '#64748B', fontSize: 12, fontWeight: 700 }} />
                           <Radar
                             name="Estudante"
                             dataKey="A"
                             stroke="#2563EB"
                             fill="#2563EB"
                             fillOpacity={0.5}
                           />
                         </RadarChart>
                       </ResponsiveContainer>
                    </div>
                 </section>

                 {/* Information Column */}
                 <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                       {profileCards.map((p, i) => (
                         <ProfileSubCard 
                           key={i}
                           title={p.title}
                           value={p.value}
                           desc={p.desc}
                           icon={Target}
                         />
                       ))}
                    </div>
                    
                    {/* Estudo IA Section */}
                    <section className="bg-gradient-to-br from-slate-900 to-primary rounded-[40px] p-10 shadow-2xl shadow-primary/20 text-white relative overflow-hidden">
                       <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
                       <div className="relative z-10 flex flex-col items-center text-center gap-6">
                          <div className="w-16 h-16 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20">
                             <Sparkles className="text-white" size={32} />
                          </div>
                          <div>
                             <h2 className="text-2xl font-black mb-2">Maximize seu Potencial</h2>
                             <p className="text-white/60 font-medium">A IA do Singul-AH pode analisar seu perfil e sugerir como estudar de forma épica para as próximas provas.</p>
                          </div>
                          <button 
                            onClick={() => setIsGeneratingIA(true)}
                            className="bg-white text-primary px-10 py-5 rounded-3xl font-black uppercase text-xs tracking-widest hover:scale-105 active:scale-95 transition-all shadow-xl"
                          >
                             ✨ Gerar Dicas Personalizadas
                          </button>
                       </div>
                    </section>

                    <AnimatePresence>
                       {isGeneratingIA && (
                         <motion.div 
                           initial={{ opacity: 0, height: 0 }}
                           animate={{ opacity: 1, height: 'auto' }}
                           className="bg-white rounded-[40px] p-10 atmospheric-shadow border border-slate-100"
                         >
                            <div className="flex items-center gap-3 mb-8">
                               <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                                  <Info size={20} />
                               </div>
                               <h3 className="text-xl font-black text-on-surface">Sugestão do Singul-AH AI</h3>
                            </div>
                            <div className="space-y-6 text-on-surface-variant font-medium leading-relaxed">
                               <p>Com base no seu perfil, aqui estão dicas adaptadas:</p>
                               <ul className="space-y-4">
                                  <li className="flex gap-4">
                                     <div className="w-6 h-6 rounded-full bg-primary/5 flex items-center justify-center text-primary font-black text-[10px] shrink-0 mt-1">1</div>
                                     <span>Use materiais que se alinhem à sua dimensão vencedora (ex: recursos visuais se Visual).</span>
                                  </li>
                                  <li className="flex gap-4">
                                     <div className="w-6 h-6 rounded-full bg-primary/5 flex items-center justify-center text-primary font-black text-[10px] shrink-0 mt-1">2</div>
                                     <span>Mantenha anotações coerentes com a sua forma de aprender.</span>
                                  </li>
                               </ul>
                            </div>
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

function ProfileSubCard({ title, value, desc, icon: Icon }: any) {
  return (
    <div className="bg-white p-6 rounded-[32px] border border-slate-100 atmospheric-shadow-sm flex flex-col gap-4">
       <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-slate-50 text-slate-400 flex items-center justify-center">
             <Icon size={20} />
          </div>
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{title}</span>
       </div>
       <div className="space-y-1">
          <p className="text-lg font-black text-on-surface tracking-tight leading-tight">{value}</p>
          <p className="text-xs text-on-surface-variant/60 font-medium leading-relaxed">{desc}</p>
       </div>
    </div>
  );
}
