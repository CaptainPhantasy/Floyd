/**
 * Skills Panel - Manage and activate skills
 */

import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { 
  Sparkles, 
  Check, 
  Plus, 
  Trash2, 
  ChevronDown,
  ChevronRight,
  Loader2
} from 'lucide-react';

interface Skill {
  id: string;
  name: string;
  description: string;
  instructions: string;
  triggers?: string[];
  enabled: boolean;
  category: string;
  icon?: string;
  isActive?: boolean;
}

interface SkillsPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SkillsPanel({ isOpen, onClose }: SkillsPanelProps) {
  const [skills, setSkills] = useState<Skill[]>([]);
  const [loading, setLoading] = useState(false);
  const [expandedSkill, setExpandedSkill] = useState<string | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newSkill, setNewSkill] = useState({
    name: '',
    description: '',
    instructions: '',
    category: 'custom' as const,
  });

  // Load skills
  useEffect(() => {
    if (isOpen) {
      loadSkills();
    }
  }, [isOpen]);

  const loadSkills = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/skills');
      const data = await res.json();
      setSkills(data.skills);
    } catch (err) {
      console.error('Failed to load skills:', err);
    } finally {
      setLoading(false);
    }
  };

  const toggleSkill = async (skill: Skill) => {
    const endpoint = skill.isActive 
      ? `/api/skills/${skill.id}/deactivate`
      : `/api/skills/${skill.id}/activate`;
    
    await fetch(endpoint, { method: 'POST' });
    await loadSkills();
  };

  const deleteSkill = async (id: string) => {
    if (!confirm('Delete this skill?')) return;
    await fetch(`/api/skills/${id}`, { method: 'DELETE' });
    await loadSkills();
  };

  const createSkill = async () => {
    if (!newSkill.name || !newSkill.instructions) return;
    
    await fetch('/api/skills', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...newSkill,
        enabled: true,
        triggers: [],
      }),
    });
    
    setNewSkill({ name: '', description: '', instructions: '', category: 'custom' });
    setShowCreateForm(false);
    await loadSkills();
  };

  if (!isOpen) return null;

  const activeSkills = skills.filter(s => s.isActive);
  const categories = [...new Set(skills.map(s => s.category))];

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex justify-end">
      <div className="w-[480px] bg-crush-elevated h-full overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-crush-overlay flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-crush-secondary" />
            <h2 className="font-semibold">Skills</h2>
            {activeSkills.length > 0 && (
              <span className="text-xs bg-crush-secondary/20 text-crush-secondary px-2 py-0.5 rounded-full">
                {activeSkills.length} active
              </span>
            )}
          </div>
          <button onClick={onClose} className="text-crush-text-secondary hover:text-crush-text-selected">
            ✕
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-crush-text-secondary" />
            </div>
          ) : (
            <>
              {/* Active skills summary */}
              {activeSkills.length > 0 && (
                <div className="bg-crush-secondary/10 border border-crush-secondary/30 rounded-lg p-3">
                  <div className="text-sm text-crush-secondary font-medium mb-2">Active Skills</div>
                  <div className="flex flex-wrap gap-2">
                    {activeSkills.map(skill => (
                      <span 
                        key={skill.id}
                        className="text-xs bg-crush-secondary/30 text-crush-secondary px-2 py-1 rounded"
                      >
                        {skill.icon || '✨'} {skill.name}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Skills by category */}
              {categories.map(category => (
                <div key={category}>
                  <div className="text-xs uppercase text-crush-text-subtle font-medium mb-2">
                    {category}
                  </div>
                  <div className="space-y-2">
                    {skills.filter(s => s.category === category).map(skill => (
                      <div 
                        key={skill.id}
                        className={cn(
                          'bg-crush-modal/50 rounded-lg border transition-colors',
                          skill.isActive 
                            ? 'border-crush-secondary/50 bg-crush-secondary/10' 
                            : 'border-crush-modal'
                        )}
                      >
                        <div 
                          className="flex items-center gap-3 p-3 cursor-pointer"
                          onClick={() => setExpandedSkill(
                            expandedSkill === skill.id ? null : skill.id
                          )}
                        >
                          <span className="text-xl">{skill.icon || '✨'}</span>
                          <div className="flex-1 min-w-0">
                            <div className="font-medium text-sm">{skill.name}</div>
                            <div className="text-xs text-crush-text-secondary truncate">
                              {skill.description}
                            </div>
                          </div>
                          
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleSkill(skill);
                            }}
                            className={cn(
                              'w-8 h-8 rounded-full flex items-center justify-center',
                              skill.isActive
                                ? 'bg-crush-primary text-crush-text-selected'
                                : 'bg-crush-overlay text-crush-text-secondary hover:bg-crush-modal'
                            )}
                          >
                            <Check className="w-4 h-4" />
                          </button>
                          
                          {expandedSkill === skill.id ? (
                            <ChevronDown className="w-4 h-4 text-crush-text-secondary" />
                          ) : (
                            <ChevronRight className="w-4 h-4 text-crush-text-secondary" />
                          )}
                        </div>
                        
                        {expandedSkill === skill.id && (
                          <div className="px-3 pb-3 border-t border-crush-modal/50 mt-2 pt-2">
                            <div className="text-xs text-crush-text-secondary whitespace-pre-wrap">
                              {skill.instructions}
                            </div>
                            {skill.triggers && skill.triggers.length > 0 && (
                              <div className="mt-2">
                                <span className="text-xs text-crush-text-subtle">Triggers: </span>
                                {skill.triggers.map((t, i) => (
                                  <span key={i} className="text-xs bg-crush-overlay px-1.5 py-0.5 rounded mr-1">
                                    {t}
                                  </span>
                                ))}
                              </div>
                            )}
                            {skill.category === 'custom' && (
                              <button
                                onClick={() => deleteSkill(skill.id)}
                                className="mt-2 text-xs text-crush-error hover:text-red-300 flex items-center gap-1"
                              >
                                <Trash2 className="w-3 h-3" />
                                Delete skill
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))}

              {/* Create new skill */}
              {showCreateForm ? (
                <div className="bg-crush-modal/50 rounded-lg border border-crush-modal p-4 space-y-3">
                  <div className="font-medium text-sm">Create New Skill</div>
                  
                  <input
                    placeholder="Skill name"
                    value={newSkill.name}
                    onChange={(e) => setNewSkill(p => ({ ...p, name: e.target.value }))}
                    className="w-full bg-crush-elevated border border-crush-modal rounded px-3 py-2 text-sm"
                  />
                  
                  <input
                    placeholder="Description"
                    value={newSkill.description}
                    onChange={(e) => setNewSkill(p => ({ ...p, description: e.target.value }))}
                    className="w-full bg-crush-elevated border border-crush-modal rounded px-3 py-2 text-sm"
                  />
                  
                  <textarea
                    placeholder="Instructions (what Claude should do when this skill is active)"
                    value={newSkill.instructions}
                    onChange={(e) => setNewSkill(p => ({ ...p, instructions: e.target.value }))}
                    className="w-full bg-crush-elevated border border-crush-modal rounded px-3 py-2 text-sm h-32 resize-none"
                  />
                  
                  <div className="flex gap-2">
                    <button
                      onClick={createSkill}
                      disabled={!newSkill.name || !newSkill.instructions}
                      className="px-3 py-1.5 bg-crush-secondary text-sm rounded hover:bg-crush-grape disabled:opacity-50"
                    >
                      Create
                    </button>
                    <button
                      onClick={() => setShowCreateForm(false)}
                      className="px-3 py-1.5 bg-crush-overlay text-sm rounded hover:bg-crush-modal"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => setShowCreateForm(true)}
                  className="w-full py-2 border border-dashed border-crush-modal rounded-lg text-sm text-crush-text-secondary hover:border-crush-overlay hover:text-crush-text-tertiary flex items-center justify-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Create Custom Skill
                </button>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
