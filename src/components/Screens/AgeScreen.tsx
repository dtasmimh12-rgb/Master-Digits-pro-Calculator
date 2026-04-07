import React from 'react';
import { motion } from 'motion/react';
import { ChevronLeft, Cake, Calendar, User } from 'lucide-react';
import { 
  differenceInYears, 
  differenceInMonths, 
  differenceInDays, 
  addMonths, 
  startOfDay, 
  isBefore, 
  setYear, 
  format, 
  differenceInWeeks 
} from 'date-fns';

interface AgeScreenProps {
  dob: string | null;
  onBack: () => void;
  onEditDob: () => void;
}

export const AgeScreen: React.FC<AgeScreenProps> = ({ dob, onBack, onEditDob }) => {
  return (
    <motion.div 
      initial={{ x: '100%' }}
      animate={{ x: 0 }}
      exit={{ x: '100%' }}
      transition={{ type: 'spring', damping: 25, stiffness: 200 }}
      className="fixed inset-0 bg-background z-[60] flex flex-col"
    >
      <div className="px-6 pt-12 pb-6 flex items-center justify-between border-b border-border">
        <button onClick={onBack} className="p-3 rounded-2xl bg-secondary text-secondary-foreground active:scale-90 transition-all">
          <ChevronLeft className="w-6 h-6" />
        </button>
        <div className="flex items-center gap-3">
          <Cake className="w-5 h-5 text-primary" />
          <h2 className="text-xl font-bold text-foreground">Age Calculator</h2>
        </div>
        <div className="w-12" />
      </div>

      <div className="flex-1 overflow-y-auto p-6">
        {dob ? (
          <div className="space-y-6 max-w-md mx-auto">
            <div className="bg-secondary/50 p-8 rounded-[3rem] shadow-sm border border-border text-center">
              <div className="text-xs text-muted-foreground mb-2 font-bold uppercase tracking-widest">Current Age</div>
              <div className="flex justify-center items-baseline gap-2">
                <span className="text-7xl font-black text-foreground">
                  {differenceInYears(new Date(), new Date(dob))}
                </span>
                <span className="text-muted-foreground font-bold text-xl">Years</span>
              </div>
              <div className="grid grid-cols-2 gap-4 mt-8 pt-8 border-t border-border">
                <div>
                  <div className="text-[10px] text-muted-foreground uppercase font-bold mb-1">Months</div>
                  <div className="text-3xl font-black text-foreground">{differenceInMonths(new Date(), new Date(dob)) % 12}</div>
                </div>
                <div>
                  <div className="text-[10px] text-muted-foreground uppercase font-bold mb-1">Days</div>
                  <div className="text-3xl font-black text-foreground">
                    {differenceInDays(new Date(), addMonths(new Date(dob), differenceInMonths(new Date(), new Date(dob))))}
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-card p-6 rounded-3xl shadow-sm border border-border">
                <div className="text-[10px] text-muted-foreground uppercase font-bold mb-2">Total Days</div>
                <div className="text-2xl font-black text-primary">{differenceInDays(new Date(), new Date(dob)).toLocaleString()}</div>
              </div>
              <div className="bg-card p-6 rounded-3xl shadow-sm border border-border">
                <div className="text-[10px] text-muted-foreground uppercase font-bold mb-2">Total Weeks</div>
                <div className="text-2xl font-black text-primary">{differenceInWeeks(new Date(), new Date(dob)).toLocaleString()}</div>
              </div>
            </div>

            <div className="bg-primary text-primary-foreground p-8 rounded-[3rem] shadow-xl shadow-primary/20">
              <div className="flex items-center gap-4 mb-4">
                <div className="p-3 bg-primary-foreground/20 rounded-2xl backdrop-blur-md">
                  <Calendar className="w-6 h-6" />
                </div>
                <div>
                  <div className="text-xs font-bold text-primary-foreground/60 uppercase tracking-wider">Next Birthday</div>
                  <div className="text-lg font-bold">
                    {(() => {
                      const today = startOfDay(new Date());
                      const birthDate = new Date(dob);
                      let nextBirthday = setYear(birthDate, today.getFullYear());
                      if (isBefore(nextBirthday, today)) {
                        nextBirthday = setYear(birthDate, today.getFullYear() + 1);
                      }
                      return format(nextBirthday, 'MMMM d, yyyy');
                    })()}
                  </div>
                </div>
              </div>
              <div className="text-4xl font-black">
                {(() => {
                  const today = startOfDay(new Date());
                  const birthDate = new Date(dob);
                  let nextBirthday = setYear(birthDate, today.getFullYear());
                  if (isBefore(nextBirthday, today)) {
                    nextBirthday = setYear(birthDate, today.getFullYear() + 1);
                  }
                  return differenceInDays(nextBirthday, today);
                })()} Days Left
              </div>
            </div>

            <button 
              onClick={onEditDob}
              className="w-full py-5 bg-secondary text-secondary-foreground rounded-3xl font-bold active:scale-95 transition-all border border-border"
            >
              Update Date of Birth
            </button>
          </div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-8 h-full">
            <div className="w-24 h-24 bg-secondary rounded-full flex items-center justify-center mb-8">
              <User className="w-12 h-12 text-muted-foreground" />
            </div>
            <h3 className="text-2xl font-black mb-3 text-foreground">No Date of Birth</h3>
            <p className="text-muted-foreground mb-10 max-w-xs">Set your birthday to see your age and get notifications.</p>
            <button 
              onClick={onEditDob}
              className="w-full max-w-xs py-5 bg-primary text-primary-foreground rounded-3xl font-bold shadow-lg shadow-primary/20 active:scale-95 transition-all"
            >
              Set Birthday
            </button>
          </div>
        )}
      </div>
    </motion.div>
  );
};
