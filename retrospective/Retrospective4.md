RETROSPECTIVE (Team 1)
=====================================

## PROCESS MEASURES 

### Macro statistics

- Number of stories committed vs done 11/11
- Total points committed vs done 48/48
- Nr of hours planned vs spent (as a team) 91h 55m/96h



### Detailed statistics

| Story  | # Tasks | Points | Hours est. | Hours actual |
|--------|---------|--------|------------|--------------|
| _#0_   |    30     |    -   |      52h 10m      |    56h          |
| n    19  |      6   |    3    |     6h 45m       |       8h       |
| n    10  |     7    |    8    |          9h  |        8h 30m      |
| n   20   |  6       |   8     |     8h 30m       |   8h           |
| n    14  |   2      | 3       |     2h       |        2h      |
| n   11   |  0       | 3       |      0      |      0        |
| n    17  |      2   |   3     |     2h       |    2h          |
| n   12   |       1  |     8   |         2h 30m   |      2h 30m        |
| n   13   |      1   | 5       |   2h         |  2h            |
| n   15   |      1   |   3     |     1h       |       1h       |
| n   16   |      1   |     3   |       30m     |    30m          |
| n   18   |    5     |    2    |      5h 30m      |    5h 30m          |
   

- Hours per task average, standard deviation (estimate and actual)

|            | Mean | StDev |
|------------|------|-------|
| Estimation |    1h 13m |   39m    | 
| Actual     |   1h 14m   |   40m    |

- Total estimation error ratio: sum of total hours spent / sum of total hours effort - 1

    $$\frac{\sum_i spent_{task_i}}{\sum_i estimation_{task_i}} - 1 = 4.44\%$$
    
- Absolute relative task estimation error: sum( abs( spent-task-i / estimation-task-i - 1))/n

    $$\frac{1}{n}\sum_i^n \left| \frac{spent_{task_i}}{estimation_task_i}-1 \right| = 3.11\% $$

  
## QUALITY MEASURES 

- Unit Testing:
  - Total hours estimated: 8h 45m
  - Total hours spent: 12h 15m
  - Nr of automated unit test cases: 340
  - Coverage: 81.52%
- E2E testing:
  - Total hours estimated: 6 hours
  - Total hours spent: 6 hours
  - Nr of test cases: manual testing while merging fronted-backend and pull requests
- Code review 
  - Total hours estimated: 3 hours
  - Total hours spent: 3 hours 
- Technical Debt management:
  - Strategy adopted: Added the pipeline to sonarqube in the pull requests so the number of issues cannot increase, define some more hours in order to decrease the number of errors already in the main branch
  - Total hours estimated estimated: 2 hours
  - Total hours spent: 2 hours
  


## ASSESSMENT

- What caused your errors in estimation (if any)?

  Some unexpected bugs were the main reason, although we tried to prevent them by overestimating some tasks. Moreover, we allocated some hours to increase the test coverage, but we weren't satisfied with the achieved goal, so we added some more time to that.

- What lessons did you learn (both positive and negative) in this sprint?

	The fact that we had such a strong fundamentals made it a lot easier to implement remaning stories
	without having to go back and change what we already done in previous sprints

- Which improvement goals set in the previous retrospective were you able to achieve? 

	Not to leave undone work and start new stories, this also made it easier to do more stories
  
- Which ones you were not able to achieve? Why?

	We wanted to increase more the coverage of the test but at least we made sure not to lower it but keep
	at least the same of the previous sprint. We also wanted to lower more the number of issues in sonarqube
	but did not have that much time left

- Improvement goals for the next sprint and how to achieve them (technical tasks, team coordination, etc.)

	Asking more for help when something is not working as it should so that anyone who is free and not working
	for new tasks can help the other team member
	
	We as a team should be more strict about deadlines otherwise we will not be able to deliver the product as
	it should be

- One thing you are proud of as a Team!!
  
  We managed to finish all the stories, a goal that seemed unreachable at the beginning of the project and even at the end of the last sprint. In the end, the bond and friendship created between each team member pushed us to complete what we started, fostering a strong sense of teamwork and collaboration.  