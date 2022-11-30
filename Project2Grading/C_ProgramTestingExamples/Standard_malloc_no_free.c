
#include <stdlib.h>
#include <stdio.h>

int main()
{
    //allocate pointer
   int *ptr = (int *) malloc(sizeof(int));
 
   return 0; /* Return without freeing ptr*/
}