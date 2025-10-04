import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class CounterAnimationService {

  /**
   * Animates a numeric value from start to end with easing
   * @param element - HTML element to update
   * @param start - Starting value
   * @param end - Ending value
   * @param duration - Animation duration in milliseconds
   * @param easing - Easing function type
   */
  animateValue(
    element: HTMLElement, 
    start: number, 
    end: number, 
    duration: number = 1000,
    easing: 'linear' | 'easeOut' | 'easeInOut' | 'bounce' = 'easeOut'
  ): void {
    const startTimestamp = performance.now();
    const difference = end - start;

    const step = (currentTimestamp: number) => {
      const elapsed = currentTimestamp - startTimestamp;
      const progress = Math.min(elapsed / duration, 1);

      // Apply easing function
      const easedProgress = this.getEasingFunction(easing)(progress);

      const currentValue = Math.round(start + (difference * easedProgress));

      // Format number with commas for large values
      element.textContent = this.formatNumber(currentValue);

      if (progress < 1) {
        requestAnimationFrame(step);
      }
    };

    requestAnimationFrame(step);
  }

  /**
   * Animates a percentage value with % symbol
   */
  animatePercentage(
    element: HTMLElement, 
    start: number, 
    end: number, 
    duration: number = 1000
  ): void {
    const startTimestamp = performance.now();
    const difference = end - start;

    const step = (currentTimestamp: number) => {
      const elapsed = currentTimestamp - startTimestamp;
      const progress = Math.min(elapsed / duration, 1);
      const easedProgress = this.easeOutCubic(progress);

      const currentValue = Math.round(start + (difference * easedProgress));
      element.textContent = `${currentValue}%`;

      if (progress < 1) {
        requestAnimationFrame(step);
      }
    };

    requestAnimationFrame(step);
  }

  /**
   * Creates a counting animation that counts up from 0 to target
   */
  countUp(
    element: HTMLElement,
    target: number,
    duration: number = 2000,
    startDelay: number = 0
  ): void {
    setTimeout(() => {
      this.animateValue(element, 0, target, duration, 'easeOut');
    }, startDelay);
  }

  /**
   * Creates an odometer-style rolling effect
   */
  rollTo(
    element: HTMLElement,
    start: number,
    end: number,
    duration: number = 1500
  ): void {
    const startTimestamp = performance.now();
    const difference = end - start;

    const step = (currentTimestamp: number) => {
      const elapsed = currentTimestamp - startTimestamp;
      const progress = Math.min(elapsed / duration, 1);

      // Bouncy easing for rolling effect
      const easedProgress = this.easeOutBounce(progress);
      const currentValue = Math.round(start + (difference * easedProgress));

      element.textContent = this.formatNumber(currentValue);
      element.style.transform = `translateY(${(1 - progress) * 10}px)`;

      if (progress < 1) {
        requestAnimationFrame(step);
      } else {
        element.style.transform = 'translateY(0)';
      }
    };

    requestAnimationFrame(step);
  }

  /**
   * Formats numbers with proper thousand separators
   */
  private formatNumber(num: number): string {
    return num.toLocaleString();
  }

  /**
   * Gets the appropriate easing function
   */
  private getEasingFunction(type: string): (t: number) => number {
    switch (type) {
      case 'linear':
        return (t: number) => t;
      case 'easeOut':
        return this.easeOutCubic;
      case 'easeInOut':
        return this.easeInOutCubic;
      case 'bounce':
        return this.easeOutBounce;
      default:
        return this.easeOutCubic;
    }
  }

  /**
   * Easing Functions
   */
  private easeOutCubic(t: number): number {
    return 1 - Math.pow(1 - t, 3);
  }

  private easeInOutCubic(t: number): number {
    return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
  }

  private easeOutBounce(t: number): number {
    const n1 = 7.5625;
    const d1 = 2.75;

    if (t < 1 / d1) {
      return n1 * t * t;
    } else if (t < 2 / d1) {
      return n1 * (t -= 1.5 / d1) * t + 0.75;
    } else if (t < 2.5 / d1) {
      return n1 * (t -= 2.25 / d1) * t + 0.9375;
    } else {
      return n1 * (t -= 2.625 / d1) * t + 0.984375;
    }
  }

  /**
   * Animate multiple elements in sequence
   */
  animateSequence(
    elements: { element: HTMLElement; start: number; end: number; delay: number }[],
    duration: number = 1000
  ): void {
    elements.forEach(({ element, start, end, delay }) => {
      setTimeout(() => {
        this.animateValue(element, start, end, duration);
      }, delay);
    });
  }
}