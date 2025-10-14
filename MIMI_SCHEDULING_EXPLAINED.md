# MIMI Planning - Comment Fonctionne la Planification Automatique

## 🎯 Vue d'ensemble

Le système MIMI Planning crée automatiquement les plannings des médecins en 3 phases :

1. **Phase 1** : Installation des activités fixes (backbone)
2. **Phase 2** : Attribution des activités tournantes (rotations)
3. **Phase 3** : Résolution des conflits et équilibrage

---

## 📊 Données de départ

### Pour chaque médecin, le système connaît :

**1. Le Backbone (activités fixes)**
- Activités que le médecin fait **toujours**, chaque semaine
- Exemple : YC fait toujours TP le lundi, TeleCs le mardi matin

**2. Les Compétences (skills)**
- Liste des activités médicales que le médecin peut faire
- Exemple : FL peut faire HTC1, HDJ, AMI, EMIT, EMATIT

**3. Les Rotations**
- Activités que les médecins font à tour de rôle
- Exemple : HTC1 → Période 1: FL, Période 2: CL, Période 3: NS

**4. Les Contraintes**
- Besoins spécifiques hebdomadaires
- Exemple : FL a besoin de 2 TeleCs par semaine, mais pas le mercredi

### Durées des activités (par créneau de 4h) :

| Activité | Durée | Note |
|----------|-------|------|
| HTC1 | 1h | Consultations rapides |
| HTC1_visite | 4h | Visites à domicile |
| HDJ | 4h | Hôpital de jour |
| EMIT | 3h | Évaluations maladies infectieuses |
| AMI | 1h | Consultations externes |
| Cs | 3h | Consultations standard |
| TeleCs | 3h | Téléconsultations |
| TP | 4h | Temps partiel (indisponible) |
| Staff | 0h | Réunions (n'occupe pas de temps) |

**Important** : Un créneau = 4h maximum. Si Cs (3h) est déjà planifié, il reste 1h de capacité.

---

## 🔧 Phase 1 : Installation des Backbones

Le système place d'abord toutes les activités fixes de chaque médecin.

**Exemple - Backbone de YC :**

```
Semaine de YC après Phase 1 :
┌─────────┬─────────┬─────────┬─────────┬─────────┐
│ Lundi   │ Mardi   │ Mercredi│ Jeudi   │ Vendredi│
├─────────┼─────────┼─────────┼─────────┼─────────┤
│ AM: TP  │ TeleCs  │ AM: TP  │ TeleCs  │Chefferie│
│ PM: TP  │ Cs      │ PM: TP  │ Cs      │Staff +  │
│         │         │         │         │Chefferie│
└─────────┴─────────┴─────────┴─────────┴─────────┘
```

**Points clés :**
- TP = médecin indisponible pour d'autres activités
- TeleCs/Cs occupent 3h, laissent 1h de capacité
- Staff (0h) peut coexister avec d'autres activités

---

## 🔄 Phase 2 : Attribution des Rotations

### Fonctionnement des cycles de rotation

Le système utilise des **cycles de rotation** prédéfinis qui déterminent quel médecin fait quelle activité à chaque période.

**Exemple - Cycle "honeymoon_NS_noHDJ" (6 périodes) :**

```
Période 1 → Période 2 → Période 3 → (se répète)

HTC1 : FL → CL → NS → FL → CL → NS
HDJ  : CL → FL → FL → CL → FL → CL
AMI  : NS → NS → CL → NS → NS → FL
HTC2 : MG → MDLC → RNV → MG → MDLC → RNV
EMIT : MDLC → RNV → MG → MDLC → RNV → MG
EMATIT: RNV → MG → MDLC → RNV → MG → MDLC
```

### Processus d'attribution

Pour chaque activité tournante, le système :

**1. Récupère le modèle d'activité**
- Pattern idéal hebdomadaire pour cette activité

**2. Calcule les tâches restantes**
- Activités du modèle - Activités déjà dans les backbones

**3. Fusionne avec le backbone du médecin assigné**
- Ajoute les activités là où il y a de la capacité

**Exemple - Ajout de HTC1 à FL (Période 1) :**

```
Modèle HTC1 (besoin hebdomadaire) :
Lundi AM : HTC1 (1h)
Lundi PM : HTC1 (1h)
Mardi AM : HTC1_visite (4h)
...

Backbone de FL :
Lundi AM : Cs (3h) → Capacité restante : 1h ✅
Lundi PM : Vide → Capacité : 4h ✅
Mercredi : TP (4h) → Pas de capacité ❌

Résultat - FL après ajout HTC1 :
Lundi AM : Cs (3h) + HTC1 (1h) = 4h
Lundi PM : HTC1 (1h)
Mercredi : TP (pas d'ajout possible)
```

Ce processus se répète pour toutes les activités tournantes (HTC1, HTC2, HDJ, AMI, EMIT, EMATIT).

---

## ⚖️ Phase 3 : Résolution des Conflits

Après la Phase 2, des problèmes peuvent survenir. La Phase 3 les corrige systématiquement.

### Types de conflits

1. **Doublons** : Deux médecins assignés à la même activité au même moment
2. **Manques** : Activité requise non couverte
3. **Dépassements** : Plus de 4h planifiées dans un créneau
4. **Déséquilibre** : Charge de travail inéquitable

### Système de résolution (ordre d'exécution)

Le système applique les résolveurs de conflits dans cet ordre précis :

#### **1. resolveHTCConflicts() - Conflits HTC1/HTC2**

**Problème typique :** FL et CL ont tous deux HTC1 le jeudi matin

**Solution :**
```
1. Compter les assignations actuelles :
   - FL : 8 créneaux HTC1
   - CL : 4 créneaux HTC1

2. Calculer la charge de travail totale :
   - FL : 32h cette semaine
   - CL : 28h cette semaine

3. Retirer de celui qui est le plus chargé :
   → FL est plus chargé
   → Supprimer HTC1 du jeudi AM de FL

4. Vérifier la couverture :
   → CL garde le jeudi AM HTC1 ✅
```

#### **2. resolveEMITConflicts() - Conflits EMIT avec équilibrage de charge**

**Problème typique :** EMIT assigné à deux médecins le mardi PM

**Solution (avec visibilité sur la charge globale) :**
```
1. Identifier les doublons :
   - MDLC : EMIT mardi PM
   - RNV : EMIT mardi PM

2. Consulter la charge de travail cumulée sur TOUT le cycle :
   - MDLC : 180h sur les 12 périodes
   - RNV : 165h sur les 12 périodes

3. Vérifier qui est assigné EMIT cette période :
   - EMIT est assigné à MDLC pour cette période
   - RNV n'est pas assigné EMIT cette période

4. Décision équitable :
   → MDLC est plus chargé ET est l'assigné officiel
   → Retirer EMIT du planning de MDLC
   → RNV garde EMIT (moins chargé globalement)

5. Mettre à jour le workload cumulatif :
   → Recalculer les charges après modification
```

**Clé :** Ce résolveur reçoit le workload cumulatif de TOUTES les périodes, pas juste la période actuelle. Cela permet des décisions équitables sur l'ensemble du cycle.

#### **3. resolveEMATITConflicts() - Conflits EMATIT avec équilibrage de charge**

**Même logique que resolveEMITConflicts() mais pour l'activité EMATIT**

Ce résolveur utilise également la charge cumulée sur tout le cycle pour prendre des décisions équitables.

#### **4. resolveTeleCsConflicts() - Couverture TeleCs**

**Problème typique :** FL a besoin de 2 TeleCs/semaine mais n'en a qu'une

**Solution :**
```
1. Identifier les besoins non satisfaits :
   - FL a 1 TeleCs, en a besoin de 2
   - Manque : 1 TeleCs

2. Trouver les créneaux disponibles :
   - Contrainte FL : "Peut être AM ou PM, mais PAS mercredi"
   - Mardi PM : Cs (3h) → Peut remplacer par TeleCs

3. Vérifier les contraintes :
   - Mardi ≠ mercredi ✅
   - Capacité suffisante (3h = 3h) ✅

4. Effectuer le remplacement :
   - Mardi PM : [Cs] → [TeleCs]

5. Mettre à jour la charge de travail :
   - Ajouter la durée TeleCs au total de FL
```

### Ordre d'exécution important

L'ordre des résolveurs est crucial :

```
resolveHTCConflicts()
    ↓
resolveEMITConflicts() ← reçoit workload cumulatif
    ↓
resolveEMATITConflicts() ← reçoit workload cumulatif
    ↓
resolveTeleCsConflicts() ← reçoit workload cumulatif
```

**Pourquoi cet ordre ?**
1. **HTC d'abord** : Activités les plus fréquentes, base de la charge de travail
2. **EMIT/EMATIT ensuite** : Résolution avec visibilité sur la charge globale (12 périodes)
3. **TeleCs en dernier** : Contraintes individuelles satisfaites après les activités collectives

**Important :** EMIT, EMATIT et TeleCs reçoivent tous le workload cumulatif sur l'ensemble du cycle (12 périodes), ce qui leur permet de prendre des décisions équitables. Il n'y a pas d'étape d'équilibrage autonome - l'équilibrage est intégré dans ces résolveurs.

---

## ✅ Validation Finale

Après les 3 phases, le système vérifie :

### 1. Couverture complète
```
Pour chaque jour :
  Pour chaque créneau :
    Pour chaque activité requise :
      Nombre de médecins assignés = 1 ? ✅
```

### 2. Score d'équité
```
Pour chaque médecin :
  Total heures = Somme des durées d'activités

Moyenne = Total de tous les médecins / Nombre de médecins

Pour chaque médecin :
  Écart = |Heures médecin - Moyenne|
  Écart % = Écart / Moyenne

Score d'équité = 100% - (Moyenne des écarts %)

Cibles :
- > 90% : ✅ Excellent
- 80-90% : ⚠️ Bon
- < 80% : ❌ À améliorer
```

### 3. Respect des compétences
```
Pour chaque médecin :
  Pour chaque activité assignée :
    Activité dans les compétences du médecin ? ✅
```

### 4. Respect des contraintes
```
Vérifier :
- FL a 2 TeleCs/semaine, pas le mercredi ✅
- Tous les médecins ont 1 Staff le vendredi PM ✅
- Pas de dépassement de capacité (max 4h/créneau) ✅
```

---

## 📋 Résumé : Le Pipeline Complet

```
ENTRÉE
├─ 10 profils de médecins
├─ Cycle de rotation sélectionné
└─ Période sélectionnée (1-6)
         ↓
    PHASE 1
    Installation des backbones
    (activités fixes)
         ↓
    PHASE 2
    Attribution des rotations
    (selon le cycle)
         ↓
    PHASE 3
    Résolution des conflits
    ├─ resolveHTCConflicts()
    ├─ resolveEMITConflicts() (avec workload global)
    ├─ resolveEMATITConflicts() (avec workload global)
    └─ resolveTeleCsConflicts() (avec workload global)
         ↓
    VALIDATION
    ├─ Couverture : 100% ✅
    ├─ Doublons : 0 ✅
    ├─ Équité : > 85% ✅
    └─ Contraintes : OK ✅
         ↓
    SORTIE
    Planning complet et valide
```

---

## 💡 Concepts Clés

| Concept | Définition | Exemple |
|---------|-----------|---------|
| **Backbone** | Activités fixes d'un médecin | YC fait toujours TP le lundi |
| **Rotation** | Activités à tour de rôle | HTC1: FL → CL → NS |
| **Période** | Phase du cycle de rotation (1-6) | Période 1, Période 2... |
| **Cycle** | Pattern d'attribution sur 6 périodes | honeymoon_NS_noHDJ |
| **Capacité** | Temps disponible dans un créneau (max 4h) | Cs (3h) laisse 1h |
| **Conflit** | Problème à résoudre | Doublon, manque, surcharge |
| **Équité** | Équilibre de la charge de travail | Score > 85% = bon |

---

## ❓ Questions Fréquentes

### Comment savoir si le planning est bon ?

Vérifier dans l'application :
- **Couverture** : 100% (toutes les activités assignées)
- **Doublons** : 0 (pas d'assignations multiples)
- **Score d'équité** : > 85% (charge équitable)
- **Coches vertes (✅)** : Sur chaque jour/créneau

### Pourquoi le médecin X a-t-il l'activité Y ?

Consulter le cycle de rotation actuel dans `customPlanningLogic.js` :
```javascript
period: 1,
HTC1: "FL",  ← FL a HTC1 en Période 1
```

### Différence entre période et semaine ?

- **Période** : Phase de rotation (1-6), détermine les assignations
- **Semaine** : Semaine calendaire (Semaine 44, 45...), affichage

Le système mappe les périodes aux semaines du calendrier.

---

**Version :** 1.0 (version courte)
**Mise à jour :** 2025-01-10
**Application :** MIMI Planning
**Public :** Personnel médical et administratif
