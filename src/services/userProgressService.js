// src/services/userProgressService.js
import { supabase } from "@/lib/supabase";

export class UserProgressService {
  // 🔥 CREAR O ACTUALIZAR USUARIO
  static async createOrUpdateUser(githubUser) {
    try {
      const userData = {
        github_id: githubUser.id,
        github_username: githubUser.login,
        github_name: githubUser.name,
        github_email: githubUser.email,
        github_avatar_url: githubUser.avatar_url,
        github_bio: githubUser.bio,
        github_location: githubUser.location,
        github_public_repos: githubUser.public_repos,
        github_followers: githubUser.followers,
        github_following: githubUser.following,
        github_created_at: githubUser.created_at,
        last_activity_date: new Date().toISOString().split("T")[0],
      };

      // Upsert usuario
      const { data: user, error } = await supabase
        .from("users")
        .upsert(userData, {
          onConflict: "github_id",
          ignoreDuplicates: false,
        })
        .select()
        .single();

      if (error) {
        console.error("❌ Error upsert usuario:", error);
        throw error;
      }

      console.log("✅ Usuario creado/actualizado:", user.github_username);

      // Inicializar progreso si es nuevo usuario
      await this.initializeUserProgress(user.id);

      return user;
    } catch (error) {
      console.error("❌ Error creando/actualizando usuario:", error);
      throw error;
    }
  }

  // 🚀 INICIALIZAR PROGRESO DE NUEVO USUARIO
  static async initializeUserProgress(userId) {
    try {
      console.log("🔄 Inicializando progreso para usuario:", userId);

      // Verificar si ya tiene módulos
      const { data: existingModules } = await supabase
        .from("module_progress")
        .select("*")
        .eq("user_id", userId);

      if (existingModules && existingModules.length > 0) {
        console.log("✅ Usuario ya tiene progreso inicializado");
        return;
      }

      // Módulos predefinidos
      const modules = [
        {
          module_id: "module-0",
          module_title: "Fundamentos",
          total_lessons: 3,
        },
        {
          module_id: "module-1",
          module_title: "Tu Primer Repositorio",
          total_lessons: 5,
        },
        {
          module_id: "module-2",
          module_title: "El Arte de Ramificar",
          total_lessons: 4,
        },
        {
          module_id: "module-3",
          module_title: "Colaboración y Remotos",
          total_lessons: 6,
        },
        { module_id: "module-4", module_title: "La Forja", total_lessons: 8 },
        {
          module_id: "module-5",
          module_title: "Biblioteca de Comandos",
          total_lessons: 1,
        },
      ];

      const moduleData = modules.map((module) => ({
        user_id: userId,
        ...module,
      }));

      const { error: moduleError } = await supabase
        .from("module_progress")
        .insert(moduleData);

      if (moduleError) {
        console.error("❌ Error insertando módulos:", moduleError);
        throw moduleError;
      }

      // Log de actividad inicial
      const { error: activityError } = await supabase
        .from("activity_log")
        .insert({
          user_id: userId,
          activity_type: "user_registered",
          activity_title: "Bienvenido a GitLearning",
          activity_description: "Usuario registrado exitosamente",
        });

      if (activityError) {
        console.warn("⚠️ Error registrando actividad inicial:", activityError);
      }

      console.log("✅ Progreso inicializado correctamente");
    } catch (error) {
      console.error("❌ Error inicializando progreso:", error);
    }
  }

  // 📊 OBTENER PROGRESO COMPLETO DEL USUARIO
  static async getUserProgress(userId) {
    try {
      console.log("📊 Cargando progreso del usuario:", userId);

      const [userResult, moduleResult, achievementResult, activityResult] =
        await Promise.all([
          // Usuario básico
          supabase.from("users").select("*").eq("id", userId).single(),

          // Progreso de módulos
          supabase
            .from("module_progress")
            .select("*")
            .eq("user_id", userId)
            .order("module_id"),

          // Logros
          supabase
            .from("user_achievements")
            .select("*")
            .eq("user_id", userId)
            .order("earned_at", { ascending: false }),

          // Actividad reciente
          supabase
            .from("activity_log")
            .select("*")
            .eq("user_id", userId)
            .order("created_at", { ascending: false })
            .limit(10),
        ]);

      if (userResult.error) {
        console.error("❌ Error cargando usuario:", userResult.error);
        throw userResult.error;
      }
      if (moduleResult.error) {
        console.error("❌ Error cargando módulos:", moduleResult.error);
        throw moduleResult.error;
      }
      if (achievementResult.error) {
        console.error("❌ Error cargando logros:", achievementResult.error);
        throw achievementResult.error;
      }
      if (activityResult.error) {
        console.error("❌ Error cargando actividad:", activityResult.error);
        throw activityResult.error;
      }

      console.log("✅ Progreso cargado correctamente");

      return {
        user: userResult.data,
        modules: moduleResult.data,
        achievements: achievementResult.data,
        recentActivity: activityResult.data,
      };
    } catch (error) {
      console.error("❌ Error obteniendo progreso:", error);
      throw error;
    }
  }

  // ✅ COMPLETAR LECCIÓN
  static async completeLesson(
    userId,
    moduleId,
    lessonId,
    lessonTitle,
    pointsEarned = 50
  ) {
    try {
      console.log(`✅ Completando lección: ${lessonTitle}`);

      // 1. Marcar lección como completada
      const { error: lessonError } = await supabase
        .from("lesson_progress")
        .upsert(
          {
            user_id: userId,
            module_id: moduleId,
            lesson_id: lessonId,
            lesson_title: lessonTitle,
            is_completed: true,
            points_earned: pointsEarned,
            completed_at: new Date().toISOString(),
            attempts: 1,
          },
          {
            onConflict: "user_id,lesson_id",
          }
        );

      if (lessonError) throw lessonError;

      // 2. Actualizar progreso del módulo
      await this.updateModuleProgress(userId, moduleId);

      // 3. Actualizar puntos del usuario
      await this.addUserPoints(userId, pointsEarned);

      // 4. Registrar actividad
      await this.logActivity(
        userId,
        "lesson_completed",
        `Completaste: ${lessonTitle}`,
        {
          module_id: moduleId,
          lesson_id: lessonId,
          points_earned: pointsEarned,
        }
      );

      return true;
    } catch (error) {
      console.error("❌ Error completando lección:", error);
      throw error;
    }
  }

  // 📈 ACTUALIZAR PROGRESO DE MÓDULO
  static async updateModuleProgress(userId, moduleId) {
    try {
      // Obtener lecciones completadas del módulo
      const { data: completedLessons, error } = await supabase
        .from("lesson_progress")
        .select("*")
        .eq("user_id", userId)
        .eq("module_id", moduleId)
        .eq("is_completed", true);

      if (error) throw error;

      // Obtener info del módulo
      const { data: moduleInfo } = await supabase
        .from("module_progress")
        .select("total_lessons")
        .eq("user_id", userId)
        .eq("module_id", moduleId)
        .single();

      const totalLessons = moduleInfo?.total_lessons || 1;
      const completedCount = completedLessons.length;
      const progressPercentage = Math.round(
        (completedCount / totalLessons) * 100
      );
      const isCompleted = progressPercentage === 100;

      // Actualizar progreso del módulo
      const { error: updateError } = await supabase
        .from("module_progress")
        .update({
          completed_lessons: completedCount,
          progress_percentage: progressPercentage,
          is_completed: isCompleted,
          is_started: true,
          last_accessed_at: new Date().toISOString(),
          points_earned: completedLessons.reduce(
            (sum, lesson) => sum + (lesson.points_earned || 0),
            0
          ),
          ...(isCompleted && { completed_at: new Date().toISOString() }),
        })
        .eq("user_id", userId)
        .eq("module_id", moduleId);

      if (updateError) throw updateError;

      // Si se completó el módulo, dar insignia
      if (isCompleted) {
        await this.awardAchievement(
          userId,
          `module_${moduleId}_complete`,
          `Módulo Completado`,
          `Completaste el módulo ${moduleId}`,
          "🎓",
          200
        );
      }
    } catch (error) {
      console.error("❌ Error actualizando progreso de módulo:", error);
    }
  }

  // 💰 AÑADIR PUNTOS AL USUARIO
  static async addUserPoints(userId, points) {
    try {
      // Intentar usar función SQL primero
      const { error: rpcError } = await supabase.rpc("add_user_points", {
        p_user_id: userId,
        p_points: points,
      });

      if (rpcError) {
        // Si la función no existe, usar update manual
        console.log("🔄 Función SQL no disponible, usando update manual");

        const { data: user } = await supabase
          .from("users")
          .select("total_points, current_level")
          .eq("id", userId)
          .single();

        const newPoints = (user?.total_points || 0) + points;
        const newLevel = Math.floor(newPoints / 250) + 1;

        const { error: updateError } = await supabase
          .from("users")
          .update({
            total_points: newPoints,
            current_level: newLevel,
          })
          .eq("id", userId);

        if (updateError) throw updateError;

        console.log(
          `💰 +${points} puntos. Total: ${newPoints} (Nivel ${newLevel})`
        );
      } else {
        console.log(`💰 +${points} puntos añadidos via función SQL`);
      }
    } catch (error) {
      console.error("❌ Error añadiendo puntos:", error);
    }
  }

  // 🏆 OTORGAR LOGRO
  static async awardAchievement(
    userId,
    achievementType,
    name,
    description,
    emoji,
    points = 0
  ) {
    try {
      // Verificar si ya tiene el logro
      const { data: existing } = await supabase
        .from("user_achievements")
        .select("*")
        .eq("user_id", userId)
        .eq("achievement_type", achievementType)
        .single();

      if (existing) return false; // Ya lo tiene

      // Otorgar logro
      const { error } = await supabase.from("user_achievements").insert({
        user_id: userId,
        achievement_type: achievementType,
        achievement_name: name,
        achievement_description: description,
        achievement_emoji: emoji,
        points_awarded: points,
      });

      if (error) throw error;

      // Añadir puntos si corresponde
      if (points > 0) {
        await this.addUserPoints(userId, points);
      }

      // Registrar actividad
      await this.logActivity(
        userId,
        "achievement_earned",
        `¡Nuevo logro: ${name}!`,
        {
          achievement_type: achievementType,
          points_earned: points,
        }
      );

      console.log(`🏆 Nuevo logro: ${name} (+${points} puntos)`);
      return true;
    } catch (error) {
      console.error("❌ Error otorgando logro:", error);
      return false;
    }
  }

  // 📝 REGISTRAR ACTIVIDAD
  static async logActivity(userId, activityType, title, metadata = {}) {
    try {
      const { error } = await supabase.from("activity_log").insert({
        user_id: userId,
        activity_type: activityType,
        activity_title: title,
        activity_description: metadata.description || "",
        module_id: metadata.module_id,
        lesson_id: metadata.lesson_id,
        achievement_type: metadata.achievement_type,
        points_earned: metadata.points_earned || 0,
      });

      if (error) throw error;
    } catch (error) {
      console.error("❌ Error registrando actividad:", error);
    }
  }

  // 🔥 ACTUALIZAR RACHA
  static async updateStreak(userId) {
    try {
      const today = new Date().toISOString().split("T")[0];

      const { data: user } = await supabase
        .from("users")
        .select("last_activity_date, current_streak, longest_streak")
        .eq("id", userId)
        .single();

      if (!user) return;

      const lastActivity = user.last_activity_date;
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = yesterday.toISOString().split("T")[0];

      let newStreak = user.current_streak || 0;

      if (lastActivity === yesterdayStr) {
        // Actividad consecutiva
        newStreak += 1;
      } else if (lastActivity !== today) {
        // Se rompió la racha o es primer día
        newStreak = 1;
      }

      const newLongestStreak = Math.max(user.longest_streak || 0, newStreak);

      const { error } = await supabase
        .from("users")
        .update({
          current_streak: newStreak,
          longest_streak: newLongestStreak,
          last_activity_date: today,
        })
        .eq("id", userId);

      if (error) throw error;

      // Logros por racha
      if (newStreak === 7) {
        await this.awardAchievement(
          userId,
          "streak_7",
          "Racha de 7 días",
          "Aprendiste 7 días consecutivos",
          "🔥",
          100
        );
      } else if (newStreak === 30) {
        await this.awardAchievement(
          userId,
          "streak_30",
          "Racha de 30 días",
          "Un mes de aprendizaje constante",
          "💪",
          500
        );
      }

      console.log(`🔥 Racha actualizada: ${newStreak} días`);
    } catch (error) {
      console.error("❌ Error actualizando racha:", error);
    }
  }
}
