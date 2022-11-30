#include <stdlib.h>
#include <stdio.h>
char *func ( )
{
        return malloc(20); // make sure to memset this location to. Allocates space to 
        // point too but never stores it because its dynamically allocated
}

void callingFunc ( )
{
        func ( ); // Problem lies here 
}

int main()
{
    //calls function
   callingFunc();
 
   return 0; 
}

