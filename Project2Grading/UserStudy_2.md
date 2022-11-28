# User Study 2


## User Study Goal
With our implementation complete, we sought out a few 213 students that wanted to test the extension and gauge the usefulness. 
We provided them with some example C programs and asked them to manually detect the possible, or definite, memory leaks. 
After spending considerable time, neither of the students were able to perfectly spot all possible, or definite, memory leaks.
We then enabled the extension to show the students the instant, and more accurate, memory leak predictions that our analysis identified. They were amazed and excited to try the extension. 
We then asked the students to write a C program that purposely produced memory leaks in different ways, according to what they learned in class. 
Below outlines their reactions and feedback to our examples, and the program they wrote.


## Study participant X
Overall, student X was impressed and felt that our analysis tool covered many of the memory leak cases he was able to produce. 
However, they felt that simply having a red (error), or orange (warning), underline beneath the leaked memory block allocation (such as malloc), with little error information, was confusing.
Through investigation, they were able to discover why there was an orange (memory loss warning) or red (memory loss detection) in some spots, but they felt it would be helpful for our tool to include
more descriptive error messages.


## Study participant Y
Overall, much like student X, student Y felt that our analysis tool covered many of the memory leak cases he was able to produce. 
They emphasized that when looking through our pre-existing example programs, the tool was super useful! 
But when they started writing their own C program, they found it super annoying that there was memory leak detections all over the place while they were writing the program,
even for memory allocations they were planning on freeing later on in the program (just hadn't got there yet!). They thought it could be a good idea to have a button to run the analysis tool, rather than have it run
every time you make a change to the program.


## Conclusion
### Feedback
The two overarching pieces of feedback was:
1. More descriptive error messages would be helpful
2. Memory leak errors were sometimes annoying in the cases where the user planned to free the memory later on in the program, but just hadn't written the free() yet.
### Changes In Our Implementation
1. We changed our error messages to include more information about what exactly a "Error" vs a "Warning" actually is - an error is a detection where the memory is definitely lost, no matter what, whereas a warning is a situation where there is a path through the program that the memory is lost.
2. We considered changing the frequency of the program analysis, rather than having an "on-file-change" trigger. Ultimately we did not have time to introduce a button for the user to click and run the analysis, nor did we understand exactly how we would accomplish that. Another option we considered is changing the analysis to be triggered "on-file-save", rather than "on-file-change", (which was a simple, small change) however, we opted not to go this route, as users may want to see the memory analysis without saving their C program. 

