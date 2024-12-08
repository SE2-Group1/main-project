RETROSPECTIVE (Team 1)
=====================================

## PROCESS MEASURES 

### Macro statistics

- Number of stories committed vs done 3/4
- Total points committed vs done 11/14
- Nr of hours planned vs spent (as a team) 90h 45m / 96h

**Remember**  a story is done ONLY if it fits the Definition of Done:
 
- Unit Tests passing
- Code review completed
- Code present on VCS
- End-to-End tests performed

> Please refine your DoD 

### Detailed statistics

| Story  | # Tasks | Points | Hours est. | Hours actual |
|--------|---------|--------|------------|--------------|
| _#0_   |   35      |    -   |    7d 3h 20m        |    7d 7h 5m          |
| #7    |   6      |   3     |     1d 2h 55m       |      1d 1h 55m        |
#8 | 3 | 5 | 3h | 3h 30m |
#9 | 5 | 3 | 7h 30m | 1d 1h |

> place technical tasks corresponding to story `#0` and leave out story points (not applicable in this case)

- Hours per task (average, standard deviation)
	- Hours per task average = 1h 40m
	- Standard deviation =  1h 21m

- Total task estimation error ratio: sum of total hours estimation / sum of total hours spent -1 = 5.7%

  
## QUALITY MEASURES 

- Unit Testing:
  - Total hours estimated: 4h
  - Total hours spent: 3h
  - Nr of automated unit test cases: 204
  - Coverage (if available): 80.04%
- E2E testing:
  - Total hours estimated: 6h 30m
  - Total hours spent: 6h 30m
- Code review 
  - Total hours estimated: 3h
  - Total hours spent: 3h
- Technical Debt management: 
  - Strategy adopted: The first part of the sprint focused primarily on reviewing the existing code. In particular, great attention was given to cleaning up the codebase. We removed duplicate code and code that could potentially introduce bugs into our software. This was made possible thanks to the use of SonarCloud. We had numerous uncategorized tasks related to bug resolution and SonarCloud issues. Now that we have integrated SonarCloud into our pipeline, every time a pull request is opened, it cannot be closed until all SonarCloud issues are resolved. This ensures that no new bugs are introduced into the main branch.
  - Total hours estimated at sprint planning: 2h
  - Total hours spent: 2h
  


## ASSESSMENT

- What caused your errors in estimation (if any)?

The estimation errors were mainly due to the need to align our work with what others had implemented. After completing our part, we often had to spend additional time ensuring consistency across the application, which wasn't initially accounted for in the estimates.

- What lessons did you learn (both positive and negative) in this sprint?

We learned to align our branches more regularly, which helped minimize conflicts during the final merge. However, we also realized that merging too many branches at once can be complicated, so it's better to merge more frequently to avoid this issue.

- Which improvement goals set in the previous retrospective were you able to achieve?

We improved communication by scheduling meetings throughout the sprint, which facilitated better coordination among team members. 
Additionally, we allocated dedicated time for bug fixing during the code integration phase, which helped us avoid last-minute issues and ensure smoother delivery.
  
- Which ones you were not able to achieve? Why?

We weren't able to complete one story we estimated, despite being close to finishing it. This was mainly due to unexpected challenges that arose during the final stages, which took longer than anticipated to resolve.

- Improvement goals for the next sprint and how to achieve them (technical tasks, team coordination, etc.)

Streamline the code review process by setting clear deadlines early in the sprint to avoid delays and reduce bottlenecks.

> Propose one or two

- One thing you are proud of as a Team!!

We collaborated and communicated well throughout the sprint. Despite challenges, we managed to stay aligned and help each other out.
