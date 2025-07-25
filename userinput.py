#!/usr/bin/env python3
"""
Interactive User Input Script
Allows user to provide input for the next set of tasks.
"""

def get_user_input():
    print("\n" + "="*70)
    print("INTERACTIVE TASK LOOP - AUTHENTICATION SYSTEM COMPLETE")
  
    while True:
        user_input = input("\nPlease enter your next instruction (or 'stop' to exit): ").strip()
        
        if user_input.lower() == 'stop':
            print("\n👋 Goodbye! Your DeepSeek chat application is ready to use.")
            print("Don't forget to set up your database and environment variables!")
            break
        elif user_input:
            print(f"\n📝 You entered: {user_input}")
            print("✅ Task noted! The authentication system is complete.")
            print("🔄 Ready for your next instruction...")
            return user_input
        else:
            print("❌ Please enter a valid instruction or 'stop' to exit.")

if __name__ == "__main__":
    get_user_input() 