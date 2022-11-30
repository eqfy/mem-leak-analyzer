#include <stdio.h>
#include <stdlib.h>

//not sure if our code handles cases like this but this was an example I thought of
//feel free to throw if not needed
int main() {

  int i;
  int *a;
  printf("%d\n", 2);
  //allocate an array to take in 10 ints
  a = calloc(10, sizeof(int));

//store 10 values from 0 - 10 (writes out of bounds)
  for(i=0; i <= 10; i++) {
    a[i] = i;
  }
  //read values from 0 - 10 (reads out of bounds)
  for(i=0; i <= 10; i++) {
    printf("%d\n", a[i]);
  }

  return 0;
}