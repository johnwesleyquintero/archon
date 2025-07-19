"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Modal } from "@/components/ui/modal"
import { Badge } from "@/components/ui/badge"
import { Sun, Target, Heart, Lightbulb, Calendar, BookOpen, Zap, Coffee, Mountain, Briefcase } from "lucide-react"
import { cn } from "@/lib/utils"

interface JournalTemplate {
  id: string
  name: string
  description: string
  icon: React.ElementType
  category: "daily" | "reflection" | "planning" | "creative" | "wellness"
  title: string
  content: string
  color: string
}

const templates: JournalTemplate[] = [
  {
    id: "daily-reflection",
    name: "Daily Reflection",
    description: "End your day with thoughtful reflection",
    icon: Sun,
    category: "daily",
    color: "bg-orange-50 text-orange-700 border-orange-200",
    title: "Daily Reflection - {date}",
    content: `## How was my day?

**Three things that went well:**
- 
- 
- 

**One thing I could improve:**
- 

**What am I grateful for today?**
- 
- 
- 

**Tomorrow I want to focus on:**
- 

**Mood:** 😊 (Rate 1-10: )

**Energy Level:** ⚡ (Rate 1-10: )

---
*Additional thoughts and reflections:*

`,
  },
  {
    id: "morning-pages",
    name: "Morning Pages",
    description: "Stream of consciousness morning writing",
    icon: Coffee,
    category: "daily",
    color: "bg-amber-50 text-amber-700 border-amber-200",
    title: "Morning Pages - {date}",
    content: `## Morning Stream of Consciousness

*Write continuously for 10-15 minutes. Don't worry about grammar, spelling, or making sense. Just let your thoughts flow onto the page.*

**What's on my mind right now:**

**How am I feeling this morning:**

**What am I looking forward to today:**

**Any worries or concerns:**

**Random thoughts:**

---
*Remember: There's no wrong way to do morning pages. Just write whatever comes to mind.*
`,
  },
  {
    id: "goal-planning",
    name: "Goal Planning",
    description: "Plan and track your goals systematically",
    icon: Target,
    category: "planning",
    color: "bg-blue-50 text-blue-700 border-blue-200",
    title: "Goal Planning Session - {date}",
    content: `## Goal Planning & Review

**Current Goal:** 

**Why is this goal important to me?**
- 
- 

**Specific Actions I Need to Take:**
1. 
2. 
3. 
4. 

**Potential Obstacles:**
- **Obstacle:** 
  - *Solution:* 
- **Obstacle:** 
  - *Solution:* 

**Success Metrics:**
- 
- 

**Target Completion Date:** 

**Next Steps (This Week):**
- [ ] 
- [ ] 
- [ ] 

**Resources I Need:**
- 
- 

---
*Progress Notes:*

`,
  },
  {
    id: "gratitude-log",
    name: "Gratitude Log",
    description: "Focus on the positive aspects of your life",
    icon: Heart,
    category: "wellness",
    color: "bg-pink-50 text-pink-700 border-pink-200",
    title: "Gratitude Log - {date}",
    content: `## Today I'm Grateful For...

**Three Big Things:**
1. 
2. 
3. 

**Three Small Things:**
1. 
2. 
3. 

**Someone who made my day better:**
- **Who:** 
- **How:** 

**A moment that brought me joy:**


**Something I often take for granted:**


**A challenge I'm grateful for (and why):**


**Looking ahead - something I'm excited about:**


---
*"Gratitude turns what we have into enough." - Anonymous*

**Gratitude Score Today:** ⭐⭐⭐⭐⭐ (1-5 stars)
`,
  },
  {
    id: "creative-brainstorm",
    name: "Creative Brainstorm",
    description: "Capture and develop your creative ideas",
    icon: Lightbulb,
    category: "creative",
    color: "bg-yellow-50 text-yellow-700 border-yellow-200",
    title: "Creative Brainstorm - {date}",
    content: `## Creative Ideas & Inspiration

**Main Idea/Project:**

**Initial Thoughts:**
- 
- 
- 

**Inspiration Sources:**
- 
- 
- 

**Possible Approaches:**
1. **Approach A:** 
   - *Pros:* 
   - *Cons:* 

2. **Approach B:** 
   - *Pros:* 
   - *Cons:* 

**Resources Needed:**
- 
- 

**Next Steps:**
- [ ] 
- [ ] 
- [ ] 

**Random Ideas & Connections:**


**Questions to Explore:**
- 
- 

---
*"Creativity is intelligence having fun." - Albert Einstein*
`,
  },
  {
    id: "weekly-review",
    name: "Weekly Review",
    description: "Reflect on your week and plan ahead",
    icon: Calendar,
    category: "reflection",
    color: "bg-purple-50 text-purple-700 border-purple-200",
    title: "Weekly Review - Week of {date}",
    content: `## Weekly Review & Planning

**Week of:** {date}

### Looking Back
**Biggest Wins This Week:**
- 
- 
- 

**Challenges I Faced:**
- 
- 

**Lessons Learned:**
- 
- 

**Goals Completed:**
- [ ] 
- [ ] 
- [ ] 

**Goals In Progress:**
- [ ] 
- [ ] 

### Looking Ahead
**Top 3 Priorities for Next Week:**
1. 
2. 
3. 

**Appointments & Commitments:**
- **Monday:** 
- **Tuesday:** 
- **Wednesday:** 
- **Thursday:** 
- **Friday:** 

**Personal Goals for Next Week:**
- 
- 

**One Thing I Want to Improve:**


---
**Overall Week Rating:** ⭐⭐⭐⭐⭐ (1-5 stars)
**Energy Level:** 📊 (1-10)
**Stress Level:** 📊 (1-10)
`,
  },
  {
    id: "learning-log",
    name: "Learning Log",
    description: "Document your learning journey and insights",
    icon: BookOpen,
    category: "reflection",
    color: "bg-green-50 text-green-700 border-green-200",
    title: "Learning Log - {date}",
    content: `## What I Learned Today

**Topic/Subject:**

**Key Concepts:**
- 
- 
- 

**New Skills Acquired:**
- 
- 

**Interesting Facts/Insights:**
- 
- 
- 

**Questions That Arose:**
- 
- 

**How I Can Apply This:**
- 
- 

**Resources for Further Learning:**
- 
- 

**Connections to Previous Knowledge:**


**Teaching Moment:**
*If I had to explain this to someone else, I would say...*


---
**Confidence Level:** 📊 (1-10)
**Interest Level:** 📊 (1-10)
**Next Learning Goal:** 
`,
  },
  {
    id: "habit-tracker",
    name: "Habit Tracker",
    description: "Monitor and reflect on your daily habits",
    icon: Zap,
    category: "wellness",
    color: "bg-indigo-50 text-indigo-700 border-indigo-200",
    title: "Habit Tracker - {date}",
    content: `## Daily Habit Check-In

**Date:** {date}

### Habit Tracking
**Morning Routine:**
- [ ] Wake up at target time
- [ ] Meditation/Mindfulness (__ minutes)
- [ ] Exercise/Movement (__ minutes)
- [ ] Healthy breakfast
- [ ] Review daily goals

**Work/Productivity:**
- [ ] Deep work session (__ hours)
- [ ] Inbox zero
- [ ] No social media during work
- [ ] Take regular breaks

**Evening Routine:**
- [ ] No screens 1 hour before bed
- [ ] Read (__ pages/minutes)
- [ ] Prepare for tomorrow
- [ ] Gratitude practice
- [ ] Sleep by target time

### Custom Habits
- [ ] ________________
- [ ] ________________
- [ ] ________________

### Reflection
**Habits that felt easy today:**
- 

**Habits that were challenging:**
- 

**What helped me succeed:**
- 

**What got in the way:**
- 

**Tomorrow I will:**
- 

---
**Overall Habit Score:** __/__ (completed/total)
**Energy Level:** 📊 (1-10)
**Motivation Level:** 📊 (1-10)
`,
  },
  {
    id: "travel-adventure",
    name: "Travel & Adventure",
    description: "Capture your travel experiences and memories",
    icon: Mountain,
    category: "creative",
    color: "bg-teal-50 text-teal-700 border-teal-200",
    title: "Travel Journal - {date}",
    content: `## Travel Adventure Log

**Location:** 
**Date:** {date}
**Weather:** 

### Today's Journey
**Places Visited:**
- 
- 
- 

**Highlights of the Day:**
- 
- 
- 

**New Experiences:**
- 
- 

**People I Met:**
- **Name:** 
  - *Story:* 
- **Name:** 
  - *Story:* 

**Local Food/Drinks Tried:**
- 
- 

**Cultural Observations:**
- 
- 

**Unexpected Discoveries:**
- 

**Challenges/Funny Moments:**
- 

**Photos Taken:** __ (describe favorites)
- 
- 

### Reflections
**How did this place make me feel?**


**What surprised me most?**


**What would I do differently?**


**Must-see for future visitors:**
- 
- 

---
**Adventure Rating:** ⭐⭐⭐⭐⭐ (1-5 stars)
**Would I return?** Yes/No - *Why:*
`,
  },
  {
    id: "work-reflection",
    name: "Work Reflection",
    description: "Reflect on your professional growth and challenges",
    icon: Briefcase,
    category: "planning",
    color: "bg-slate-50 text-slate-700 border-slate-200",
    title: "Work Reflection - {date}",
    content: `## Professional Reflection

**Date:** {date}

### Today's Work
**Key Accomplishments:**
- 
- 
- 

**Projects Worked On:**
- **Project:** 
  - *Progress:* 
  - *Next Steps:* 
- **Project:** 
  - *Progress:* 
  - *Next Steps:* 

**Meetings & Collaborations:**
- 
- 

**Challenges Faced:**
- **Challenge:** 
  - *How I handled it:* 
- **Challenge:** 
  - *How I handled it:* 

### Learning & Growth
**New Skills Used/Developed:**
- 
- 

**Feedback Received:**
- 

**Areas for Improvement:**
- 
- 

**Professional Goals Progress:**
- **Goal:** 
  - *Status:* 
- **Goal:** 
  - *Status:* 

### Planning Ahead
**Tomorrow's Priorities:**
1. 
2. 
3. 

**This Week's Focus:**
- 

**Professional Development Action:**
- 

---
**Productivity Level:** 📊 (1-10)
**Job Satisfaction:** 📊 (1-10)
**Stress Level:** 📊 (1-10)
**Key Insight:** 
`,
  },
]

interface JournalTemplatesProps {
  isOpen: boolean
  onClose: () => void
  onSelectTemplate: (template: JournalTemplate) => void
}

export function JournalTemplates({ isOpen, onClose, onSelectTemplate }: JournalTemplatesProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>("all")

  const categories = [
    { id: "all", name: "All Templates", count: templates.length },
    { id: "daily", name: "Daily", count: templates.filter((t) => t.category === "daily").length },
    { id: "reflection", name: "Reflection", count: templates.filter((t) => t.category === "reflection").length },
    { id: "planning", name: "Planning", count: templates.filter((t) => t.category === "planning").length },
    { id: "creative", name: "Creative", count: templates.filter((t) => t.category === "creative").length },
    { id: "wellness", name: "Wellness", count: templates.filter((t) => t.category === "wellness").length },
  ]

  const filteredTemplates =
    selectedCategory === "all" ? templates : templates.filter((template) => template.category === selectedCategory)

  const handleSelectTemplate = (template: JournalTemplate) => {
    const today = new Date().toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    })

    const templateWithDate = {
      ...template,
      title: template.title.replace("{date}", today),
      content: template.content.replace(/{date}/g, today),
    }

    onSelectTemplate(templateWithDate)
    onClose()
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Choose a Journal Template" size="xl" className="max-h-[80vh]">
      <div className="space-y-6">
        {/* Category Filter */}
        <div className="flex flex-wrap gap-2">
          {categories.map((category) => (
            <Button
              key={category.id}
              variant={selectedCategory === category.id ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedCategory(category.id)}
              className={cn(
                "transition-all duration-200",
                selectedCategory === category.id ? "bg-slate-900 text-white" : "hover:bg-slate-50",
              )}
            >
              {category.name}
              <Badge variant="secondary" className="ml-2 text-xs">
                {category.count}
              </Badge>
            </Button>
          ))}
        </div>

        {/* Templates Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-96 overflow-y-auto pr-2">
          {filteredTemplates.map((template) => {
            const Icon = template.icon
            return (
              <Card
                key={template.id}
                className="cursor-pointer hover:shadow-md transition-all duration-200 hover:-translate-y-1"
                onClick={() => handleSelectTemplate(template)}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start gap-3">
                    <div className={cn("p-2 rounded-lg", template.color)}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <div className="flex-1">
                      <CardTitle className="text-base font-semibold text-slate-900">{template.name}</CardTitle>
                      <CardDescription className="text-sm text-slate-600 mt-1">{template.description}</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="flex items-center justify-between">
                    <Badge variant="outline" className="text-xs capitalize">
                      {template.category}
                    </Badge>
                    <Button size="sm" variant="ghost" className="text-xs">
                      Use Template →
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {filteredTemplates.length === 0 && (
          <div className="text-center py-8 text-slate-500">
            <p className="text-sm">No templates found in this category</p>
          </div>
        )}
      </div>
    </Modal>
  )
}
