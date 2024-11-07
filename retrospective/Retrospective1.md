TEMPLATE FOR RETROSPECTIVE (Team #1)
=====================================

The retrospective should include _at least_ the following
sections:

- [process measures](#process-measures)
- [quality measures](#quality-measures)
- [general assessment](#assessment)

## PROCESS MEASURES 

### Macro statistics

- Number of stories committed vs. done 3/8
- Total points committed vs. done 10/10
- Nr of hours planned vs. spent (as a team) 90h45m/96

**Remember**a story is done ONLY if it fits the Definition of Done:
 
- Unit Tests passing
- Code review completed
- Code present on VCS
- End-to-End tests performed

> Please refine your DoD if required (you cannot remove items!) 

### Detailed statistics

| Story  | # Tasks | Points | Hours est. | Hours actual |
|--------|---------|--------|------------|--------------|
| _#0_   |        21 |       |   1w 2d 15m |    1w 1d 7h 15m          |
| _#1_   |    6     | 2       |        1d 3h    |   1d 7h 15m           |
| _#2_   |    10     | 3       |       2d 1h    |   2d 1h 30m          |
| _#3_   |    3     | 5       |        6h 30m   |   1d          |

   

> story `#0` is for technical tasks, leave out story points (not applicable in this case)

- Hours per task average, standard deviation (estimate and actual)
  - Hours per task average (estimate) = 2h 5m
  - Hours per task average (actual) =  2h 23m
  - Standard deviation (estimate) = 26m
  - Standard deviation (actual) =  26m
- Total estimation error ratio: sum of total hours spent / sum of total hours effort - 1

    $$\frac{\sum_i spent_{task_i}}{\sum_i estimation_{task_i}} - 1 = 5.8\%$$
    
- Absolute relative task estimation error: sum( abs( spent-task-i / estimation-task-i - 1))/n

    $$\frac{1}{n}\sum_i^n \left| \frac{spent_{task_i}}{estimation_task_i}-1 \right| = 16.6\%$$
  
## QUALITY MEASURES 

- Unit Testing:
  - Total hours estimated: 3h
  - Total hours spent: 3h 45m
  - Nr of automated unit test cases: 124 
  - Coverage (if available): 77.6%
- E2E testing:
  - Total hours estimated: 6h
  - Total hours spent: 6h
- Code review 
  - Total hours estimated: 6h
  - Total hours spent: 5:30
  


## ASSESSMENT

- What caused your errors in estimation (if any)?
  Since it was the first sprint, we had many uncategorized tasks, which led to spending a lot of time setting up the project. Additionally, we encountered several issues when merging the front-end and back-end parts.
- What lessons did you learn (both positive and negative) in this sprint?
    We learned that we need to distribute work more effectively across the team.
- Which improvement goals set in the previous retrospective were you able to achieve?
    We now have strong Git repository management, and our team is organized into sub-teams that can work in parallel.
-	Which ones were you not able to achieve? Why?
    We can certainly improve our coordination between sub-teams because there was limited communication between the two teams.
-	Improvement goals for the next sprint and how to achieve them (technical tasks, team coordination, etc.)
	  - Better coordination between sub-teams
	  - Clearer guidelines for backend and frontend roles
	  - Increased interactions across teams
  > Propose one or two 
  - One thing you are proud of as a Team!
    The way we handle the pressures of deadlines