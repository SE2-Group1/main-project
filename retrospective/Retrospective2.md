TEMPLATE FOR RETROSPECTIVE (Team ##)
=====================================

The retrospective should include _at least_ the following
sections:

- [process measures](#process-measures)
- [quality measures](#quality-measures)
- [general assessment](#assessment)

## PROCESS MEASURES 

### Macro statistics

- Number of stories committed vs. done 6/8
- Total points committed vs. done 10/10
- Nr of hours planned vs. spent (as a team) 96/96

**Remember**a story is done ONLY if it fits the Definition of Done:
 
- Unit Tests passing
- Code review completed
- Code present on VCS
- End-to-End tests performed

> Please refine your DoD if required (you cannot remove items!) 

### Detailed statistics

| Story | # Tasks | Points | Hours est. | Hours actual |
| ----- | ------- | ------ | ---------- | ------------ |
| #0    | 21      |        | 5d 3h 30m  | 5d 4h 30m    |
| KX-4  | 13      | 5      | 4d 2h      | 4d 2h        |
| KX-5  | 4       | 3      | 1d 6h      | 1d 5h 55m    |
| KX-6  | 4       | 2      | 4h 30m     | 3h 35m       |
   

> story `#0` is for technical tasks, leave out story points (not applicable in this case)

- Hours per task average, standard deviation (estimate and actual)

	-  Hours per task average (estimate) = 2h 17m
	-  Hours per task average (actual) = 2h 17m
	- Standard deviation (estimate) = 15.5 hours (estimated)
	- Standard deviation (actual) =  16.1 hours (actual)

- Total estimation error ratio: sum of total hours spent / sum of total hours effort - 1
$$\frac{\sum_i spent_{task_i}}{\sum_i estimation_{task_i}} - 1 = \frac{96}{96} - 1 = 0$$
    
- Absolute relative task estimation error: sum( abs( spent-task-i / estimation-task-i - 1))/n
    $$\frac{1}{n}\sum_i^n \left| \frac{spent_{task_i}}{estimation_task_i}-1 \right| = \frac{0.0206+0+0.006+0.2037}{4} = 0.0576 $$
  
## QUALITY MEASURES 

- Unit Testing:
  - Total hours estimated: 1d 6h 30m
  - Total hours spent: 1d 6h 55m
  - Nr of automated unit test cases : 173
  - Coverage (if available):  
	  - Statements: 77.34%
	  - Functions: 72.93%
	  - Lines: 77.67%
- E2E testing:
  - Total hours estimated: 7h
  - Total hours spent: 7h 30m
- Code review 
  - Total hours estimated: 1d
  - Total hours spent: 1d 1h
  

## ASSESSMENT

- What caused your errors in estimation (if any)?

Our estimation errors were caused by changes to the database structure, which impacted some functions, and by tasks that overlapped with work already completed in the previous sprint. 
Additionally, we revised the front-end design to align with new team-agreed guidelines.

- What lessons did you learn (both positive and negative) in this sprint?

We learned to better define task dependencies while planning the sprint, but also realized the need for stronger communication between sub-teams to avoid misalignment.

- Which improvement goals set in the previous retrospective were you able to achieve?

We added API documentation to better coordinate work between the front-end and back-end teams. Additionally, we adjusted the workload distribution by assigning more members 
to the front-end, recognizing that having equal-sized sub-teams was not efficient for this sprint.

- Which ones were you not able to achieve? Why?

We were unable to fix some last-minute bugs because merging different parts of the code happened later than anticipated, due to difficulties in aligning schedules among team members.

- Improvement goals for the next sprint and how to achieve them (technical tasks, team coordination, etc.)

Improve communication by scheduling meetings also during the sprint.
Allocate dedicated time for bug fixing during code integration to avoid last-minute issues.
Propose one or two

- One thing you are proud of as a Team!

Despite the challenges we delivered a product whose quality satisfies all team members