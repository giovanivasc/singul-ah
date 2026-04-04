import infantilRaw from './bncc.json/bncc-infantil.json';
import fundamentalRaw from './bncc.json/bncc-fundamental.json';
import medioRaw from './bncc.json/bncc-medio.json';
import competenciasRaw from './bncc.json/bncc-competencias.json';

export type BnccSkill = {
  codigo: string;
  disciplina: string;
  etapa: string;
  ano: string;
  descricao: string;
  tipo: 'habilidade' | 'competencia';
};

function normalizeInfantil(): BnccSkill[] {
  const skills: BnccSkill[] = [];
  const etapa = 'Educação Infantil';
  const campos = infantilRaw.educacao_infantil?.campos_experiencia || [];
  
  for (const campo of campos) {
    const disciplina = campo.nome_campo;
    for (const faixa of (campo.faixas_etarias || [])) {
      const ano = faixa.nome_faixa;
      for (const obj of (faixa.objetivos || [])) {
        if (obj.codigo && obj.descricao) {
          skills.push({
            codigo: obj.codigo,
            disciplina: disciplina, // Usamos o "campo de experiência" como disciplina
            etapa,
            ano,
            descricao: obj.descricao,
            tipo: 'habilidade',
          });
        }
      }
    }
  }
  return skills;
}

function normalizeFundamental(): BnccSkill[] {
  const skills: BnccSkill[] = [];
  const etapa = 'Ensino Fundamental';
  
  for (const key of Object.keys(fundamentalRaw)) {
    const disciplinaObj = (fundamentalRaw as any)[key];
    const disciplina = disciplinaObj.nome_disciplina || key;
    
    for (const anoObj of (disciplinaObj.ano || [])) {
      const ano = anoObj.nome_ano;
      for (const unidade of (anoObj.unidades_tematicas || [])) {
        for (const objeto of (unidade.objeto_conhecimento || [])) {
          for (const habilidade of (objeto.habilidades || [])) {
            const text = habilidade.nome_habilidade;
            if (text) {
              const match = text.match(/^\s*\(([^)]+)\)\s*(.*)$/);
              if (match) {
                skills.push({
                  codigo: match[1],
                  disciplina,
                  etapa,
                  ano,
                  descricao: match[2],
                  tipo: 'habilidade',
                });
              } else {
                // Tenta extrair caso o formato seja diferente
                const tokens = text.split(' ');
                const possibleCode = tokens[0];
                if (possibleCode.startsWith('EF')) {
                  skills.push({
                    codigo: possibleCode,
                    disciplina,
                    etapa,
                    ano,
                    descricao: tokens.slice(1).join(' '),
                    tipo: 'habilidade',
                  });
                } else {
                  skills.push({
                    codigo: 'S/C',
                    disciplina,
                    etapa,
                    ano,
                    descricao: text,
                    tipo: 'habilidade',
                  });
                }
              }
            }
          }
        }
      }
    }
  }
  return skills;
}

function normalizeMedio(): BnccSkill[] {
  const skills: BnccSkill[] = [];
  const etapa = 'Ensino Médio';
  
  for (const key of Object.keys(medioRaw)) {
    const area = (medioRaw as any)[key];
    const disciplina = area.nome_disciplina || key;
    
    for (const anoObj of (area.ano || [])) {
      const ano = Array.isArray(anoObj.nome_ano) ? anoObj.nome_ano.join(', ') : anoObj.nome_ano;
      for (const hab of (anoObj.codigo_habilidade || [])) {
        if (hab.nome_codigo && hab.nome_habilidade) {
          skills.push({
            codigo: hab.nome_codigo,
            disciplina,
            etapa,
            ano,
            descricao: hab.nome_habilidade,
            tipo: 'habilidade',
          });
        }
      }
    }
  }
  return skills;
}

function normalizeCompetencias(): BnccSkill[] {
  const skills: BnccSkill[] = [];
  
  // Gerais
  const gerais = (competenciasRaw as any).comp_gerais;
  if (gerais && gerais.competencias) {
    gerais.competencias.forEach((desc: string, i: number) => {
      skills.push({
        codigo: `COMP-GER-${i + 1}`,
        disciplina: gerais.nome_competencia || 'Geral',
        etapa: 'Todas',
        ano: 'Todas',
        descricao: desc,
        tipo: 'competencia'
      });
    });
  }

  // Fundamental
  const fund = (competenciasRaw as any).comp_fundamental;
  if (fund) {
    for (const key of Object.keys(fund)) {
      const disc = fund[key];
      if (disc && disc.competencias) {
        disc.competencias.forEach((desc: string, i: number) => {
          skills.push({
            codigo: `COMP-${key.toUpperCase().replace('COMP_', '')}-${i + 1}`,
            disciplina: disc.nome_competencia,
            etapa: 'Ensino Fundamental',
            ano: '1º ao 9º',
            descricao: desc,
            tipo: 'competencia'
          });
        });
      }
    }
  }

  // Medio
  const medio = (competenciasRaw as any).comp_medio;
  if (medio) {
    for (const key of Object.keys(medio)) {
      const disc = medio[key];
      if (disc && disc.competencias) {
        disc.competencias.forEach((desc: string, i: number) => {
          skills.push({
            codigo: `COMP-${key.toUpperCase().replace('COMP_', '')}-${i + 1}`,
            disciplina: disc.nome_competencia,
            etapa: 'Ensino Médio',
            ano: '1º, 2º, 3º',
            descricao: desc,
            tipo: 'competencia'
          });
        });
      }
    }
  }

  return skills;
}

export const unifiedBnccData: BnccSkill[] = [
  ...normalizeInfantil(),
  ...normalizeFundamental(),
  ...normalizeMedio(),
  ...normalizeCompetencias(),
];
