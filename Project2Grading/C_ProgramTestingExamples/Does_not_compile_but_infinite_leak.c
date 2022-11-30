#include <stdlib.h>
#include <stdio.h>
//not sure if this one would work as its a weird edge case 
int main(void)
{ 
    char *line = NULL;
    size_t size = 0;
    /* The loop below leaks memory as fast as it can */
    for(int i = 0;i < 10;i++) { 
        getline(&line, &size, stdin); /* New memory implicitly allocated */
        /* will not terminate till there isn't any memeory left to allocate. Infinitely runs till then */
        line = NULL;
    }
    return 0;
 }