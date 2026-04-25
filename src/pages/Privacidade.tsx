import React from 'react';
import { Link } from 'react-router-dom';
import {
  Shield, FileText, Users, Database, Share2, Globe,
  Clock, UserCheck, Lock, AlertTriangle, Baby, Sparkles,
  FileSearch, RefreshCw, Mail
} from 'lucide-react';
import PublicPageLayout from '../components/PublicPageLayout';

interface SectionProps {
  icon: React.ComponentType<{ size?: number }>;
  anchor: string;
  number: string;
  title: string;
  children: React.ReactNode;
}

function Section({ icon: Icon, anchor, number, title, children }: SectionProps) {
  return (
    <section id={anchor} className="scroll-mt-24 mb-14">
      <div className="flex items-start gap-4 mb-5">
        <div className="w-11 h-11 rounded-2xl bg-primary/5 text-primary flex items-center justify-center shrink-0 mt-0.5">
          <Icon size={22} />
        </div>
        <div className="flex-1">
          <p className="text-[10px] font-black uppercase tracking-[0.25em] text-slate-400 mb-1">
            Seção {number}
          </p>
          <h2 className="text-2xl font-black tracking-tight text-on-surface leading-tight">
            {title}
          </h2>
        </div>
      </div>
      <div className="prose-custom ml-[60px] text-on-surface-variant font-medium leading-relaxed space-y-4 [&_strong]:text-on-surface [&_a]:text-primary [&_a:hover]:underline [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:space-y-1.5 [&_li]:marker:text-primary/50">
        {children}
      </div>
    </section>
  );
}

export default function Privacidade() {
  const toc = [
    { n: '1', anchor: 'quem', title: 'Quem somos' },
    { n: '2', anchor: 'aplicacao', title: 'A quem se aplica' },
    { n: '3', anchor: 'dados', title: 'Dados tratados e finalidades' },
    { n: '4', anchor: 'base-legal', title: 'Bases legais' },
    { n: '5', anchor: 'compartilhamento', title: 'Com quem compartilhamos' },
    { n: '6', anchor: 'internacional', title: 'Transferência internacional' },
    { n: '7', anchor: 'retencao', title: 'Retenção e eliminação' },
    { n: '8', anchor: 'direitos', title: 'Direitos do titular' },
    { n: '9', anchor: 'seguranca', title: 'Segurança' },
    { n: '10', anchor: 'incidentes', title: 'Incidentes' },
    { n: '11', anchor: 'criancas', title: 'Crianças e adolescentes' },
    { n: '12', anchor: 'ia', title: 'Uso de IA' },
    { n: '13', anchor: 'ripd', title: 'RIPD' },
    { n: '14', anchor: 'alteracoes', title: 'Alterações' },
    { n: '15', anchor: 'contato', title: 'Dúvidas' }
  ];

  return (
    <PublicPageLayout
      eyebrow="LGPD · ECA Digital"
      title="Política de Privacidade"
      subtitle="Este documento descreve como o Singul-AH coleta, usa, compartilha e protege dados pessoais, em conformidade com a Lei 13.709/2018 (LGPD) e com a Lei 15.211/2025 (ECA Digital)."
    >
      {/* Versão banner */}
      <div className="bg-white rounded-3xl p-6 border border-outline-variant/10 atmospheric-shadow mb-12 flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.25em] text-slate-400">Versão</p>
          <p className="text-lg font-black text-on-surface mt-0.5">v1.0 — 23/04/2026</p>
        </div>
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.25em] text-slate-400">Próxima revisão</p>
          <p className="text-lg font-black text-on-surface mt-0.5">23/04/2027</p>
        </div>
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.25em] text-slate-400">Documentos correlatos</p>
          <div className="flex gap-3 mt-1 text-sm font-bold">
            <Link to="/termo-consentimento" className="text-primary hover:underline">Termo de Consentimento</Link>
            <Link to="/assentimento" className="text-primary hover:underline">Assentimento</Link>
          </div>
        </div>
      </div>

      {/* Sumário */}
      <nav aria-label="Sumário" className="bg-white rounded-3xl p-6 border border-outline-variant/10 mb-16">
        <p className="text-[10px] font-black uppercase tracking-[0.25em] text-slate-400 mb-3">Sumário</p>
        <ol className="grid sm:grid-cols-2 gap-x-6 gap-y-2 text-sm font-semibold">
          {toc.map(t => (
            <li key={t.anchor}>
              <a href={`#${t.anchor}`} className="text-on-surface-variant hover:text-primary transition">
                <span className="text-primary/60 mr-2">{t.n}.</span>{t.title}
              </a>
            </li>
          ))}
        </ol>
      </nav>

      <Section icon={FileText} anchor="quem" number="1" title="Quem somos">
        <p>
          O <strong>Singul-AH</strong> é um sistema piloto de apoio à elaboração de Planos Educacionais Individualizados (PEI) para estudantes com indicativos de <strong>Altas Habilidades / Superdotação (AH/SD)</strong>, desenvolvido no contexto de pesquisa de mestrado do <strong>Programa de Pós-Graduação em Estudos Antrópicos na Amazônia (PPGEAA)</strong>, da <strong>Universidade Federal do Pará — Campus de Castanhal</strong>.
        </p>
        <div className="bg-primary/5 rounded-2xl p-5 border border-primary/10 not-prose">
          <p className="text-xs font-black uppercase tracking-[0.2em] text-primary mb-2">Controlador (LGPD Art. 5º VI)</p>
          <p className="text-sm"><strong>Giovani Vasconcelos da Silva e Silva</strong><br />
          PPGEAA — UFPA / Castanhal<br />
          <a href="mailto:giovani.silva@castanhal.ufpa.br" className="text-primary">giovani.silva@castanhal.ufpa.br</a></p>
        </div>
        <div className="bg-secondary-container/30 rounded-2xl p-5 border border-outline-variant/10 not-prose">
          <p className="text-xs font-black uppercase tracking-[0.2em] text-on-surface-variant mb-2">Encarregado / DPO (LGPD Art. 41)</p>
          <p className="text-sm">
            O próprio controlador acumula a função, nos termos do Art. 41 §3º (organização de pequeno porte).
            Canal exclusivo para privacidade:{' '}
            <a href="mailto:giovani.silva@castanhal.ufpa.br" className="text-primary">giovani.silva@castanhal.ufpa.br</a>
          </p>
        </div>
      </Section>

      <Section icon={Users} anchor="aplicacao" number="2" title="A quem esta política se aplica">
        <ul>
          <li><strong>Estudantes</strong> (crianças e adolescentes) identificados com indicativos de AH/SD;</li>
          <li><strong>Responsáveis legais</strong> — pais, mães, tutores;</li>
          <li><strong>Professores regentes, professores do AEE</strong> e equipe pedagógica da escola;</li>
          <li><strong>Pesquisadores</strong> envolvidos no estudo.</li>
        </ul>
        <p>
          O sistema <strong>não se destina a uso comercial</strong>, não realiza publicidade comportamental e não comercializa dados.
        </p>
      </Section>

      <Section icon={Database} anchor="dados" number="3" title="Dados que tratamos e finalidades">
        <h3 className="text-base font-black text-on-surface mt-2">3.1 Dados pessoais comuns</h3>
        <ul>
          <li><strong>Identificação do estudante:</strong> nome, data de nascimento, escola, turma, série — para individualização do PEI.</li>
          <li><strong>Identificação de informantes:</strong> nome do responsável, vínculo, contato; nome do professor/AEE — para rastreabilidade multi-informante.</li>
          <li><strong>Dados de acesso:</strong> e-mail institucional, credenciais Supabase Auth — autenticação segura.</li>
        </ul>

        <h3 className="text-base font-black text-on-surface mt-6">3.2 Dados pessoais sensíveis (Art. 5º II + Art. 11)</h3>
        <ul>
          <li><strong>Perfil biopsicossocial</strong> — traços cognitivos, criativos, socioemocionais, motivacionais;</li>
          <li><strong>Comportamento observado</strong> — respostas IP-SAHS, IF-SAHS, N-ILS, entrevistas;</li>
          <li><strong>Contexto familiar</strong> — relatos da família sobre o menor.</li>
        </ul>

        <h3 className="text-base font-black text-on-surface mt-6">3.3 Dados derivados</h3>
        <p>
          Outputs de IA (convergência, sugestões de plano) gerados a partir dos dados acima.{' '}
          <strong>Nenhuma decisão pedagógica é tomada exclusivamente por IA</strong> — toda sugestão é submetida à revisão humana pela equipe escolar (LGPD Art. 20).
        </p>

        <h3 className="text-base font-black text-on-surface mt-6">3.4 O que não coletamos</h3>
        <ul>
          <li>Dados biométricos, genéticos ou de saúde não declarados;</li>
          <li>Geolocalização;</li>
          <li>Dados de redes sociais;</li>
          <li>Cookies de terceiros ou trackers publicitários;</li>
          <li>Convicção religiosa, filiação política ou origem racial/étnica — salvo menção voluntária, sempre sob a mesma proteção de dado sensível.</li>
        </ul>
      </Section>

      <Section icon={Shield} anchor="base-legal" number="4" title="Bases legais do tratamento">
        <div className="overflow-x-auto not-prose">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="bg-slate-50">
                <th className="text-left p-3 font-black text-xs uppercase tracking-wider text-on-surface-variant">Operação</th>
                <th className="text-left p-3 font-black text-xs uppercase tracking-wider text-on-surface-variant">Base legal</th>
              </tr>
            </thead>
            <tbody className="text-on-surface-variant">
              <tr className="border-t border-slate-100"><td className="p-3">Coleta para o PEI</td><td className="p-3"><strong>Art. 7º III</strong> + <strong>Art. 11 II-b</strong></td></tr>
              <tr className="border-t border-slate-100 bg-slate-50/40"><td className="p-3">Coleta da família</td><td className="p-3"><strong>Art. 14 §1º</strong> (consentimento destacado do responsável)</td></tr>
              <tr className="border-t border-slate-100"><td className="p-3">Pesquisa acadêmica</td><td className="p-3"><strong>Art. 7º IV</strong> + <strong>Art. 11 II-c</strong>, com pseudonimização (Art. 13 §4º)</td></tr>
              <tr className="border-t border-slate-100 bg-slate-50/40"><td className="p-3">Compartilhamento com a escola</td><td className="p-3"><strong>Art. 7º III</strong> + finalidade originária</td></tr>
            </tbody>
          </table>
        </div>
        <p className="text-xs italic">
          <strong>Não usamos a base de "legítimo interesse"</strong> para crianças e adolescentes — apenas bases mais protetivas.
        </p>
      </Section>

      <Section icon={Share2} anchor="compartilhamento" number="5" title="Com quem compartilhamos">
        <ul>
          <li><strong>Escola do estudante</strong> — para elaboração e execução do PEI; acesso restrito à equipe pedagógica.</li>
          <li><strong>Supabase Inc.</strong> (operador técnico) — hospedagem de banco de dados e autenticação; cláusulas contratuais padrão.</li>
          <li><strong>Google LLC (Gemini API)</strong> — processamento de IA; requisições com dados pseudonimizados.</li>
          <li><strong>Orientador acadêmico e banca</strong> — validação científica; somente dados pseudonimizados.</li>
          <li><strong>ANPD e autoridades</strong> — apenas mediante requisição legal.</li>
        </ul>
        <p><strong>Não vendemos, não alugamos e não cedemos</strong> dados para fins comerciais.</p>
      </Section>

      <Section icon={Globe} anchor="internacional" number="6" title="Transferência internacional">
        <p>
          Os dados são armazenados em infraestrutura Supabase, que opera servidores fora do território nacional. A transferência se fundamenta em <strong>cláusulas-padrão contratuais</strong> (Art. 33 II-b). O processamento pela API Gemini (Google) ocorre com dados pseudonimizados e sob o mesmo fundamento. Detalhes técnicos estão no documento interno de Transferência Internacional disponível mediante solicitação.
        </p>
      </Section>

      <Section icon={Clock} anchor="retencao" number="7" title="Retenção e eliminação">
        <div className="overflow-x-auto not-prose">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="bg-slate-50">
                <th className="text-left p-3 font-black text-xs uppercase tracking-wider text-on-surface-variant">Categoria</th>
                <th className="text-left p-3 font-black text-xs uppercase tracking-wider text-on-surface-variant">Retenção</th>
                <th className="text-left p-3 font-black text-xs uppercase tracking-wider text-on-surface-variant">Ao término</th>
              </tr>
            </thead>
            <tbody className="text-on-surface-variant">
              <tr className="border-t border-slate-100"><td className="p-3">Dados do estudante</td><td className="p-3">Vigência do PEI + 5 anos</td><td className="p-3">Anonimização</td></tr>
              <tr className="border-t border-slate-100 bg-slate-50/40"><td className="p-3">Dados de pesquisa</td><td className="p-3">5 anos pós-publicação (CNS 466/12)</td><td className="p-3">Anonimização</td></tr>
              <tr className="border-t border-slate-100"><td className="p-3">Logs de acesso</td><td className="p-3">90 dias</td><td className="p-3">Eliminação automática</td></tr>
              <tr className="border-t border-slate-100 bg-slate-50/40"><td className="p-3">Registros de consentimento</td><td className="p-3">Enquanto houver tratamento + 5 anos</td><td className="p-3">Eliminação</td></tr>
              <tr className="border-t border-slate-100"><td className="p-3">Backup</td><td className="p-3">Até 90 dias após exclusão primária</td><td className="p-3">Sobrescrita</td></tr>
            </tbody>
          </table>
        </div>
      </Section>

      <Section icon={UserCheck} anchor="direitos" number="8" title="Direitos do titular (Art. 18)">
        <p>A qualquer momento, o titular (ou seu responsável legal, quando menor) pode solicitar:</p>
        <ol className="list-decimal pl-5 space-y-1.5 marker:text-primary/50">
          <li><strong>Confirmação</strong> da existência do tratamento;</li>
          <li><strong>Acesso</strong> aos dados tratados;</li>
          <li><strong>Correção</strong> de dados incompletos ou incorretos;</li>
          <li><strong>Anonimização, bloqueio ou eliminação</strong> de dados desnecessários;</li>
          <li><strong>Portabilidade</strong> em formato estruturado (JSON);</li>
          <li><strong>Eliminação</strong> de dados tratados com consentimento;</li>
          <li><strong>Informação</strong> sobre com quem compartilhamos;</li>
          <li><strong>Informação</strong> sobre a possibilidade de não consentir;</li>
          <li><strong>Revogação do consentimento</strong>.</li>
        </ol>
        <div className="bg-primary/5 rounded-2xl p-5 border border-primary/10 not-prose mt-5">
          <p className="text-xs font-black uppercase tracking-[0.2em] text-primary mb-3">Como exercer</p>
          <ul className="text-sm space-y-1.5 list-disc pl-5 marker:text-primary/50">
            <li>No sistema, em <Link to="/login" className="text-primary font-bold">/meus-dados</Link> após login;</li>
            <li>Por e-mail: <a href="mailto:giovani.silva@castanhal.ufpa.br" className="text-primary font-bold">giovani.silva@castanhal.ufpa.br</a> (assunto: "LGPD");</li>
            <li>Resposta em até <strong>15 dias</strong>; custo <strong>gratuito</strong>;</li>
            <li>Em caso de negativa, petição direta à <a href="https://www.gov.br/anpd" target="_blank" rel="noreferrer" className="text-primary font-bold">ANPD</a>.</li>
          </ul>
        </div>
      </Section>

      <Section icon={Lock} anchor="seguranca" number="9" title="Segurança da informação">
        <ul>
          <li>Criptografia em trânsito (TLS 1.2+) e em repouso (AES-256);</li>
          <li>Row-Level Security (RLS) no banco, com políticas por papel;</li>
          <li>Autenticação por e-mail institucional + OAuth Google;</li>
          <li>OTP adicional para acesso via link enviado à família;</li>
          <li>Logs de auditoria de acesso a fichas de estudantes;</li>
          <li>Pseudonimização de identificadores para pesquisa;</li>
          <li>Revisão humana obrigatória de outputs de IA.</li>
        </ul>
      </Section>

      <Section icon={AlertTriangle} anchor="incidentes" number="10" title="Incidentes de segurança">
        <p>
          Na hipótese de incidente que possa acarretar risco relevante, comunicaremos a <strong>ANPD em até 2 dias úteis</strong> e os <strong>titulares afetados</strong> imediatamente, com descrição do incidente, dados afetados, medidas de mitigação e recomendações.
        </p>
      </Section>

      <Section icon={Baby} anchor="criancas" number="11" title="Crianças e adolescentes">
        <ul>
          <li>Coletamos dados de menores <strong>somente com consentimento específico e destacado do responsável</strong> (Art. 14 §1º);</li>
          <li><strong>Privacidade por padrão</strong> — configurações mais protetivas ativas por default (ECA Digital Art. 7º);</li>
          <li><strong>Sem perfilamento comportamental</strong> para publicidade (ECA Digital Art. 26);</li>
          <li>Portal do estudante oferece <strong>ferramentas de supervisão parental</strong>;</li>
          <li>Informações ao menor em <strong>linguagem acessível</strong> (Art. 14 §6º; ECA Digital Art. 18 §1º).</li>
        </ul>
      </Section>

      <Section icon={Sparkles} anchor="ia" number="12" title="Uso de Inteligência Artificial (Art. 20)">
        <p>O Singul-AH usa IA para:</p>
        <ul>
          <li>Sugerir convergências entre respostas dos múltiplos informantes;</li>
          <li>Propor esboços de ações pedagógicas para o PEI.</li>
        </ul>
        <p><strong>Nenhuma decisão que afete o estudante é tomada exclusivamente por IA.</strong> Todo output é:</p>
        <ol className="list-decimal pl-5 space-y-1.5 marker:text-primary/50">
          <li>Exibido com sinalização clara de origem;</li>
          <li>Submetido a revisão humana obrigatória;</li>
          <li>Passível de solicitação de revisão pelo titular.</li>
        </ol>
      </Section>

      <Section icon={FileSearch} anchor="ripd" number="13" title="Relatório de Impacto (RIPD)">
        <p>
          Elaboramos RIPD específico (LGPD Art. 38) descrevendo o fluxo, ameaças identificadas e medidas de mitigação. Disponível para autoridades sob requisição.
        </p>
      </Section>

      <Section icon={RefreshCw} anchor="alteracoes" number="14" title="Alterações desta política">
        <p>
          Alterações relevantes (mudança de finalidade, de controlador, de operadores essenciais) serão comunicadas por e-mail com pelo menos <strong>30 dias de antecedência</strong> e poderão exigir novo consentimento (Art. 8º §6º).
        </p>
      </Section>

      <Section icon={Mail} anchor="contato" number="15" title="Dúvidas">
        <p>
          Fale conosco pelo e-mail{' '}
          <a href="mailto:giovani.silva@castanhal.ufpa.br" className="text-primary">giovani.silva@castanhal.ufpa.br</a>.
          Toda comunicação é tratada em até 15 dias.
        </p>
      </Section>

      <div className="mt-16 pt-8 border-t border-slate-200 text-xs text-on-surface-variant/70 italic">
        Documento elaborado em 23 de abril de 2026, em conformidade com a Lei nº 13.709/2018 (LGPD) e com a Lei nº 15.211/2025 (ECA Digital).
      </div>
    </PublicPageLayout>
  );
}
