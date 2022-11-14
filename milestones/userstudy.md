# User Study 1

## Before user study

Prior to this user study, we have identified our problem (catching memory leaks in C), conceptualized an interesting design [percentage/score model](https://docs.google.com/presentation/d/1Q4YiYVUAzXn25rvrWR4XqMS03u8YijOYlmmiVdHdMb0/edit?usp=sharing), created examples of programs we plan to support, and some preliminary visualization of the analyzer output. However, since our implementation was in a very early stage, we did not let the participants use any of our implementation.

The user study has the following sections:

1. We ask participants certain questions about C:
   1. What is your biggest issue with C programming?
   2. What are some issues you have with manual memory management?
   3. Do you think existing tools like Valgrind satisfy your needs related to memory?
2. We introduce our analyzer and show participants code examples (see examples folder) and how our analyzer treats handles them
3. We get the participant to write a small C program themself. We then apply our analysis model to their program and report the appropriate output.
4. We ask for additional question or comments

## Study participant X

Study participant X is a computer science student taking CPSC 213 and so interacts with C on a daily basis.

In response to our initial questions, X agrees that memory management is a huge pain in C, especially given how memory leaks are part of the grading for assignments. X agrees that Valgrind is a useful tool for detecting memory leaks but dislike it because using it is a very slow process. (Valgrind is a dynamic memory checker that runs your C program but does so slowly). As a result, there are often simple memory leak cases for X that take quite a while for X to figure out.

During our demo of our memory analyzer, X liked the idea that the results of the analysis will be shown directly in the code because we implement it as a VSCode language server. He thinks that it will help him consider more edge cases that he didn't think about, ultimately leading to less simple memory leak bugs. X is a bit disappointed that we treat every branch as possible even though, from a human's perspective, some branches are not possible. Since we presented the visualization based on the percentage/score model, X was really confused about the percentages and how they are even helpful for users.

Overall, X liked the idea of a static memory leak checker and cannot wait to try it on his assignments.

## Study participant Y

Study participant Y is a computer science student from CPSC 410. Y has used C quite extensively in previous courses and in internships.

Responding to our opening questions, Y thinks that C is difficult to use because there is a lack of abstractions making a lot of things very manual. One of the examples Y raised was having to create abstractions himself that involve a lot of manual manipulation and freeing of memory. Regarding tools like Valgrind, Y uses it a lot but also complains that it was quite combersome.

We then demoed our memory analyzer for Y. Y liked the fact that the memory analyzer shows errors as long as they they are potentially possible (i.e. pessimistic). Y was a bit skeptical about our percentage/score model ability to generalize to all C programs. However, Y was unable to find a counterexample during the user study. Y also agreed that the percentage/score model was able to handle extra constraints that the base pessimistic model cannot handle. For visualization, Y was confused about the percentages in our output as he thought they meant the precentage that the program will go down a certain path. Y also didn't like the fact that we were mixing stack and heap memory in the visualization (specifically how we handle pointers living the stack vs pointers in the heap). He also questioned our visualization for cases where there is a pointer loop or when two pointers point to the same place (so it actually isn't a tree). Y did like the fact that the visualization is in a tree structure and that we also have a language server.

In the end, Y suggested for us to potentially revisit the percentage/score model before we do too much implementation with it.

## Conclusion

In summary, both X and Y saw value to our memory leak analyzer and agree that it might be useful for when they are doing C programming by allowing them to think about more edge cases. X and Y also loved the fact that we are planning to do it as a language server. However, they both found the percentage/score model's visualization and output to be unintuitive. Their opinion concurs with out TA, Yanze's opinion. They also raised many good feedback about our visualization, though most of it was related to the probability/score model.

After the user studies, we went over the design of the probability/score model and discovered that there indeed exist edge cases where it would fail. Thus, we decided to go with a purely pessimistic three-state solution (memory exists, possibly exists, does not exist) as our base implementation.

Howvever, we were somewhat unsatisfied with the three-case solution for certain cases such as when a memory block is being used by multiple pointers and freeing some of the pointers. We believe there are better analysis models in these scenarios. This led to us to consider a special model (all state model), that keep tracks of all pointer pointing relationships for a block, so that it passes our analysis. However, as this design requires an exponential amount of memory, we decided to limit it to the case where there is no more than 8 pointers pointing to the same memory block. We will be updating our design in the upcoming weeks if we do decide to implement this after finishing the basic three-state analysis.
