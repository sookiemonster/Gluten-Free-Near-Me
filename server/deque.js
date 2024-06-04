function Node(val_=null, next_=null, prev_=null) {
   return {
      val : val_,
      next : next_, 
      prev : prev_
   }
}

class Deque {
   constructor() {
      this.front = null;
      this.back = null;
      this.size = 0;
   }
   
   // Getters
   peekFront() { 
      if (this.empty()) { return null; }
      return this.front.val; 
   }
   peekBack() { 
      if (this.empty()) { return null; }
      return this.back.val; 
   }
   empty() { return this.size == 0; }
   size() { return this.size; }

   // Adders 
   pushFront(val) {
      let newFront = Node(val);
      if (this.empty()) {
         this.front = this.back = newFront;
         this.size++;
         return;
      }
      // Readjust pointers
      newFront.next = this.front;
      this.front.prev = newFront;
      this.front = newFront;
      this.size++;
   }

   pushBack(val) {
      let newBack = Node(val);
      if (this.empty()) {
         this.back = this.front = newBack;
         this.size++;
         return;
      }
      // Readjust pointers
      newBack.prev = this.back;
      this.back.next = newBack;
      this.back = newBack;
      this.size++;
   }
   
   // Removers
   popFront() {
      if (this.empty()) { return null; }
      // Store the first value
      let popped = this.peekFront();

      // Increment the front
      this.front = this.front.next;
      if (this.front == null) { this.back = null; }
      else { this.front.prev = null; }
      this.size--;

      return popped;
   }

   popBack() {
      if (this.empty()) { return null; }
      // Store the last value
      let popped = this.peekBack();

      this.back = this.back.prev;
      if (this.back == null) { this.front = null; }
      else { this.back.next = null; }
      this.size--;

      return popped;
   }

   display() {
      let itr = this.front;
      let str = "";
      while (itr != null) {
         str += itr.val + " ";
         itr = itr.next;
      }
      console.log(str);
   }

   displayReverse() {
      let itr = this.back;
      let str = "";
      while (itr != null) {
         str += itr.val + " ";
         itr = itr.prev;
      }
      console.log(str);
   }
}

export { Deque };